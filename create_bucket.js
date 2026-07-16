import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
    console.log("Creating bucket 'profiles'...");
    const { data, error } = await supabase.storage.createBucket('profiles', {
        public: true,
        allowedMimeTypes: ['image/*'],
    });

    if (error) {
        console.error("Error creating bucket:", error);
    } else {
        console.log("Bucket created successfully:", data);
    }
}

main();
