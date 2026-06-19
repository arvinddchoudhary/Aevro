# AEVRO Deployment Notes

## Current Phase 1 Apps

The current stack can run locally with:

- Next.js frontend on `http://localhost:3000`
- NestJS backend on `http://localhost:8000/api/v1/health`

## Target Deployment

Production deployment target:

- Frontend: Vercel
- Backend: Render
- Database: Neon PostgreSQL
- Media: Cloudinary
- Payments: Razorpay

## Deployment Rules

- Use environment variables for all secrets.
- Do not commit `.env` files.
- Restrict CORS to trusted frontend domains.
- Run database migrations during backend deployment.
- Verify the backend health route after deploy.

## Future Verification Commands

Frontend:

```bash
cd frontend
npm run build
```

Backend:

```bash
cd backend
npm run build
npm run start:prod
```

Database:

```bash
npx prisma migrate deploy
```
