/**
 * Dummy Supabase credentials, set before anything imports the client.
 *
 * lib/supabase reads these at module scope, so assigning them inside a test
 * file is too late — imports are evaluated first. Importing this module ahead
 * of any module that reaches the database makes the ordering explicit.
 *
 * createClient does not talk to the network when it is constructed, so these
 * only need to be well-formed, and tests stub the calls they actually make.
 */
process.env.NEXT_PUBLIC_SUPABASE_URL ||= "http://localhost:54321";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||= "test-anon-key";
