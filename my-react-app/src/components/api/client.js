import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey =import.meta.env.VITE_SUPABASE_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

async function insertImagesOnce() {
  try {
    const imagesInserted = localStorage.getItem('imagesInserted');
    if (!imagesInserted) {
      await supabase.from('images').insert([
        { url: 'https://assets-in.bmscdn.com/promotions/cms/creatives/1717082518448_playcardweb.jpg' },
        { url: 'https://assets-in.bmscdn.com/promotions/cms/creatives/1717494054241_badboys1240x300.jpg' },
        { url: 'https://assets-in.bmscdn.com/promotions/cms/creatives/1717655317921_indiawebbanner.jpg' }
      ]);

      console.log('Images inserted successfully');
      localStorage.setItem('imagesInserted', true);
    } else {
      console.log('Images already inserted');
    }
  } catch (error) {
    console.error('Error inserting images:', error.message);
  }
}

insertImagesOnce();
