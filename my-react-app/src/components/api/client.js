import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://dkczjibriforsjjiikos.supabase.co";
const supabaseKey ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrY3pqaWJyaWZvcnNqamlpa29zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTY1NTMwMjYsImV4cCI6MjAzMjEyOTAyNn0.g6A0j9r94yoxkeZPGMk_hD_lnLfb6Bj2LuW1aFXsGok"
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
