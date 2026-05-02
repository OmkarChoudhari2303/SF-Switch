import { Router } from 'express';

const router = Router();

const API_VERSION = 'v62.0';

/**
 * Middleware to extract auth headers from request body
 */
function extractAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const instanceUrl = req.headers['x-sfdc-instance-url'];

  if (!authHeader || !instanceUrl) {
    return res.status(401).json({ error: 'Missing authorization or instance URL headers' });
  }

  req.sfAuth = {
    accessToken: authHeader.replace('Bearer ', ''),
    instanceUrl: instanceUrl.replace(/\/$/, '') // remove trailing slash
  };
  next();
}

/**
 * GET /api/rules
 * Fetch all validation rules for the Account object via Tooling API
 */
router.get('/', extractAuth, async (req, res) => {
  try {
    const { accessToken, instanceUrl } = req.sfAuth;
    const query = encodeURIComponent(
      "SELECT Id FROM ValidationRule WHERE EntityDefinition.QualifiedApiName = 'Account'"
    );

    const response = await fetch(
      `${instanceUrl}/services/data/${API_VERSION}/tooling/query/?q=${query}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Tooling API query failed:', data);
      return res.status(response.status).json({
        error: data[0]?.message || 'Failed to fetch validation rules'
      });
    }

    // Step 2: Fetch full metadata for each ID individually to bypass Tooling API limits
    const ids = (data.records || []).map(r => r.Id);
    
    const rulePromises = ids.map(async (id) => {
      const recordResponse = await fetch(
        `${instanceUrl}/services/data/${API_VERSION}/tooling/sobjects/ValidationRule/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      return recordResponse.json();
    });

    const fullRecords = await Promise.all(rulePromises);

    // Map to cleaner response shape
    const rules = fullRecords.map(record => ({
      id: record.Id,
      name: record.ValidationName,
      fullName: record.FullName,
      active: record.Metadata?.active ?? record.Active,
      description: record.Metadata?.description || record.Description || '',
      errorConditionFormula: record.Metadata?.errorConditionFormula || '',
      errorMessage: record.Metadata?.errorMessage || '',
      errorDisplayField: record.Metadata?.errorDisplayField || null,
      metadata: record.Metadata
    }));

    res.json({
      totalSize: rules.length,
      rules
    });
  } catch (err) {
    console.error('Fetch rules error:', err);
    res.status(500).json({ error: 'Internal server error fetching validation rules' });
  }
});

/**
 * PATCH /api/rules/:id
 * Toggle a single validation rule active/inactive
 * Body: { metadata: { ...fullMetadata } }
 */
router.patch('/:id', extractAuth, async (req, res) => {
  try {
    const { accessToken, instanceUrl } = req.sfAuth;
    const { id } = req.params;
    const { metadata } = req.body;

    if (!metadata) {
      return res.status(400).json({ error: 'Missing metadata in request body' });
    }

    const response = await fetch(
      `${instanceUrl}/services/data/${API_VERSION}/tooling/sobjects/ValidationRule/${id}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ Metadata: metadata })
      }
    );

    // Salesforce returns 204 No Content on success
    if (response.status === 204) {
      return res.json({ success: true, id });
    }

    const data = await response.json();
    console.error('Update rule failed:', data);
    return res.status(response.status).json({
      error: data[0]?.message || 'Failed to update validation rule'
    });
  } catch (err) {
    console.error('Update rule error:', err);
    res.status(500).json({ error: 'Internal server error updating validation rule' });
  }
});

/**
 * POST /api/rules/deploy
 * Deploy multiple validation rule changes
 * Body: { changes: [{ id, metadata }] }
 */
router.post('/deploy', extractAuth, async (req, res) => {
  try {
    const { accessToken, instanceUrl } = req.sfAuth;
    const { changes } = req.body;

    if (!changes || !Array.isArray(changes) || changes.length === 0) {
      return res.status(400).json({ error: 'No changes to deploy' });
    }

    const results = [];
    const errors = [];

    for (const change of changes) {
      try {
        const response = await fetch(
          `${instanceUrl}/services/data/${API_VERSION}/tooling/sobjects/ValidationRule/${change.id}`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ Metadata: change.metadata })
          }
        );

        if (response.status === 204) {
          results.push({ id: change.id, success: true });
        } else {
          const data = await response.json();
          errors.push({
            id: change.id,
            error: data[0]?.message || 'Failed to update'
          });
        }
      } catch (innerErr) {
        errors.push({
          id: change.id,
          error: innerErr.message
        });
      }
    }

    res.json({
      totalChanges: changes.length,
      successful: results.length,
      failed: errors.length,
      results,
      errors
    });
  } catch (err) {
    console.error('Deploy error:', err);
    res.status(500).json({ error: 'Internal server error during deployment' });
  }
});

export default router;
