/**
 * Local-only claim save hook retained for sub-app API compatibility.
 *
 * Per privacy & portal policy, individual employee names, GPF account numbers,
 * and claim taka amounts are kept strictly inside each user's own browser and
 * are not transmitted to the central admin database.
 */
export const syncClaimToCentral = async (
  _appType: 'app1' | 'app2' | 'app3' | 'app4',
  _claimData: {
    id?: string;
    trackingNo?: string;
    employeeName: string;
    designation: string;
    gpfAccNo: string;
    amount: number | string;
    status?: string;
    applyDate?: string;
    upazilaCode?: string;
    upazilaName?: string;
    districtName?: string;
    rawDetails?: any;
  }
): Promise<boolean> => true;
