export const appConfig = () => {
  const port = Number(process.env.PORT || 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be between 1 and 65535');
  return { app: { port, env: process.env.NODE_ENV || 'development' } };
};
