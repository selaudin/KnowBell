/**
 * Handler for Home
 *
 * @author KnowBell
 */

import { IRequest, IResponse } from '../interfaces/vendors';

class Home {
	public static index (req: IRequest, res: IResponse, next): void {
		return res.render('pages/home', {
			title: 'Home'
		});
	}
}

export default Home;
