/**
 * Define the API base url
 *
 * @author KnowBell
 */

import Locals from '../../providers/Locals';

class Home {
	public static index(req, res, next): any {
		return res.json({
			message: Locals.config().name
		});
	}
}

export default Home;
