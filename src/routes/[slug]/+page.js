import { get_page } from '../../utils/examples.js';
import data from '../_generated/data.js';

export async function load({ params }) {

	const pageDetails = get_page(data, params.slug);

	return {
		title: pageDetails.title,
		slug: params.slug,
		repl: pageDetails.files
	};
}
