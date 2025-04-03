// Function to check if an environment variable is available
export function check_secrets(envVarName: string): boolean {
  try {
    const envVar = import.meta.env[envVarName];
    return !!envVar;
  } catch (error) {
    return false;
  }
}