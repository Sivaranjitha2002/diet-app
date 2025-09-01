import express from 'express';
import { ZCQL } from '@zcatalyst/zcql';
import { Datastore } from '@zcatalyst/datastore';
import { Search } from '@zcatalyst/search';

const router = express.Router();

// Get all foods
router.get('/',  async (req, res) => {
  const db = new ZCQL();
  try {
    const foods = await db.executeZCQLQuery('select * from foods');
    res.json(foods);
  } catch (error) {
    console.error('Get foods error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search foods
router.get('/search', async (req, res) => {
  try {
    const search = new Search();
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query required' });
    }

    const foods = await search.executeSearchQuery({
      search: q,
      search_table_columns: {
        ['foods']: ['name', 'category']
      }
    });
    res.json(foods);
  } catch (error) {
    console.error('Search foods error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get food by ID
router.get('/:id', async (req, res) => {
  try {
    const datastore = new Datastore();
    const food = await datastore.table('foods').getRow(req.params.id);
    if (!food) {
      return res.status(404).json({ error: 'Food not found' });
    }

    res.json(food);
  } catch (error) {
    console.error('Get food error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;