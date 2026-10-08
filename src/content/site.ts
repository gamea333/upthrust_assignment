// Page content. Phase 7 swaps this for Sanity queries; the shape stays the same
// so components don't need to change.

import zomato from '../assets/logos/zomato.png';
import bosch from '../assets/logos/bosch.png';
import loreal from '../assets/logos/loreal.svg';
import vega from '../assets/logos/vega.png';
import dell from '../assets/logos/dell.png';

export const hero = {
  headline: 'Bold design that performs',
  notes: {
    left: { lead: 'Strategy is', marked: 'cheaper' },
    right: { lead: 'Comfortable', marked: 'is expensive' },
  },
  capabilities: ['Identity', 'Experience', 'Motion'],
  proof: {
    stat: '100+',
    label: 'Brands trusted us to define how they’re seen.',
  },
};

export const clientLogos = [
  { name: 'Zomato', image: zomato },
  { name: 'Bosch', image: bosch },
  { name: 'L’Oréal', image: loreal },
  { name: 'Vega', image: vega },
  { name: 'Dell', image: dell },
];
