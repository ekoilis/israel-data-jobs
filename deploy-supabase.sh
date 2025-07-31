#!/bin/bash

# Supabase Edge Functions Deployment Script
# Run this script after setting up your Supabase CLI and authenticating

echo "Deploying Supabase Edge Functions..."

supabase functions deploy fetch-linkedin-jobs
supabase functions deploy fetch-google-jobs  
supabase functions deploy fetch-mobileye-jobs
supabase functions deploy fetch-jobscoil-jobs
supabase functions deploy fetch-alljobs-jobs
supabase functions deploy cors-proxy

echo "All functions deployed successfully!"