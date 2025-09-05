export const flags = {
  overseer: String(process.env.REACT_APP_OVERSEER_ENABLED) === 'true',
  vector: String(process.env.REACT_APP_VECTOR_ENABLED) === 'true'
};

