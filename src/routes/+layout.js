import { get_navigation } from '../utils/examples';
import data from './_generated/data.js';

/** @type {import('./$types').LayoutLoad} */
export async function load({ params }) {

  return {
    slug: params.slug,
    navigation: get_navigation(data)
  }
}
