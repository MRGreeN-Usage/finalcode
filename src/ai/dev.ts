'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/intelligent-budget-recommendations.ts';
import '@/ai/flows/delete-user-data.ts';
