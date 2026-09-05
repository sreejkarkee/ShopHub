# ShopHub

ShopHub is a MERN e-commerce app where retailers publish products and customers browse, add items to a bag, and place orders.

## Deploy

Deploy the `client` directory to Vercel and the `server` directory to a Node host such as Render or Railway.

### Client

- Root directory: `client`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_URL=https://your-api-host.example.com/api`

### Server

Use the `server` directory as the service root and configure these environment variables from `server/.env.example`:

- `DATABASE_URL`: MongoDB Atlas connection string
- `JWT_SECRET`: long random secret
- `ADMIN_EMAIL` and `ADMIN_PASSWORD`: admin credentials
- `CLIENT_URL`: deployed Vercel URL
- `PORT`: supplied by the host, or `5001` locally

After deployment, verify `https://your-api-host.example.com/api/health` returns `{"status":"ok"}` before testing login and checkout.
