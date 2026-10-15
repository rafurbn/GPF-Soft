import { mountSubApp } from '../app-shared/bootstrap';

// App 4 - GPF Death Claim (final withdrawal for a deceased employee).
// The Upazila selected on the root dashboard is read from localStorage here,
// which is what supplies `currentUser` and the working `onBack` navigation.
void mountSubApp(() => import('./App'), { loginUrl: '/' });
