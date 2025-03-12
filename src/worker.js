// src/worker.js - Your main Cloudflare Worker file
import { Router } from 'itty-router';
import cors from 'cors';

// Create a new router
const router = Router();

// Basic CORS settings
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,HEAD,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// CORS preflight handler
router.options('*', () => {
  return new Response(null, {
    headers: corsHeaders,
  });
});

// Define your routes
router.get('/', () => {
  return new Response('Welcome to SmartScore Backend on Cloudflare Workers!', {
    headers: {
      'Content-Type': 'text/plain',
      ...corsHeaders,
    },
  });
});

// Example route handler
router.get('/api/students', async (request) => {
  // Implement your logic here
  return new Response(JSON.stringify({ message: 'Students API endpoint' }), {
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
});

// Catch-all handler for 404s
router.all('*', () => new Response('Not Found', { status: 404 }));

// Worker handler
export default {
  async fetch(request, env, ctx) {
    return router.handle(request, env, ctx);
  },
};