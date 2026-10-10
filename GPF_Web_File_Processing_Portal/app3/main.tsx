import { mountSubApp } from '../app-shared/bootstrap';

// App 3 - GPF Final Withdrawal & No-Demand.
// The Upazila selected on the root dashboard is read from localStorage here.
void mountSubApp(() => import('./App'), { loginUrl: '/' });
