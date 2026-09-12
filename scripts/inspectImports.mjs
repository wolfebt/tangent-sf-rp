import { introVolume0Articles } from './data_intro_volume0.mjs';
import { creationVolume1Articles } from './data_creation_volume1.mjs';
import { economatrixVolume2Articles } from './data_economatrix_volume2.mjs';
import { metaphysicsArticles } from './data_metaphysics.mjs';
import { architectVolume5Articles } from './data_architect_volume5.mjs';
import { architectBestiaryVolume6Articles } from './data_architect_bestiary_volume6.mjs';
import { kitinCollectiveArticles } from './data_kitin_collective.mjs';
import { additionalArchitectMatrices } from './data_matrices_volume0_2_4.mjs';

console.log('introVolume0Articles:', introVolume0Articles.map(a => a.id));
console.log('creationVolume1Articles:', creationVolume1Articles.map(a => a.id));
console.log('economatrixVolume2Articles:', economatrixVolume2Articles.map(a => a.id));
console.log('metaphysicsArticles:', metaphysicsArticles.map(a => a.id));
console.log('architectVolume5Articles:', architectVolume5Articles.map(a => a.id));
console.log('architectBestiaryVolume6Articles:', architectBestiaryVolume6Articles.map(a => a.id));
console.log('kitinCollectiveArticles:', kitinCollectiveArticles.map(a => a.id));
console.log('additionalArchitectMatrices:', additionalArchitectMatrices.map(a => a.id));
