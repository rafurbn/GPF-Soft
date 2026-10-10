import { mountSubApp } from '../app-shared/bootstrap';

// App 2 - GPF Non-Refundable Advance Withdrawal.
// The Upazila selected on the root dashboard is read from localStorage here.
void mountSubApp(() => import('./App'), { loginUrl: '/' });
