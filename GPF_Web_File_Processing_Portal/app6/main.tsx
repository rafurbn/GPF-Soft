import { mountSubApp } from '../app-shared/bootstrap';

// App 6 - Ex-Bangladesh Leave & Foreign Travel 6-Page File Processing System.
// Reads the signed-in Upazila session published by the root portal dashboard.
void mountSubApp(() => import('./App'), { loginUrl: '/' });
