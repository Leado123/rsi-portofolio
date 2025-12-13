
import { fontProviders } from 'astro/config';
console.log('fontProviders:', fontProviders);
try {
    console.log('adobe provider:', fontProviders.adobe({id: "test"}));
} catch (e) {
    console.error('Error calling adobe provider:', e);
}
