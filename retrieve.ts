
import axios from 'axios';

const TYPEKIT_API_URL = 'https://typekit.com/api/v1/json/kits';

// Replace with your generated Typekit user token
const TYPEKIT_TOKEN = 'd1ff75203879d9a35b84a3035d2dfc552921d710';

async function getProjectIds(): Promise<string[]> {
  try {
    const response = await axios.get(TYPEKIT_API_URL, {
      headers: {
        'X-Typekit-Token': TYPEKIT_TOKEN,
      },
    });

    if (response.data && response.data.kits) {
      return response.data.kits.map((kit: any) => kit.id);
    } else {
      console.log('No kits found or unexpected response format.');
      return [];
    }
  } catch (error) {
    console.error('Error fetching project IDs:', error);
    return [];
  }
}

// Example usage
getProjectIds().then((ids) => {
  console.log('Project IDs:', ids);
});
