/**
 * Defines Custom method types over Express's Response
 *
 * 
 */

import { Response } from 'express';

export interface IResponse extends Response {
	redirect(arg0: any): unknown;
}
