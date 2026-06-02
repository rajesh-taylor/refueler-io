/**
 * Refueler — useHTLCExpiry tests
 * Session 18 · lib/useHTLCExpiry.test.ts
 */

import { renderHook, act } from '@testing-library/react-hooks';
import { useHTLCExpiry, HTLC_COPY } from './useHTLCExpiry';

// Mock markOrderExpired
jest.mock('./mintInterface', () => ({
  markOrderExpired: jest.fn().mockResolvedValue(undefined),
}));

import { markOrderExpired } from './mintInterface';

beforeEach(() => {
  jest.useFakeTimers();
  (markOrderExpired as jest.Mock).mockClear();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('useHTLCExpiry', () => {
  it('starts active with seconds countdown', () => {
    const expiryUnix = Math.floor(Date.now() / 1000) + 480;
    const { result } = renderHook(() =>
      useHTLCExpiry('order-001', expiryUnix, false)
    );
    expect(result.current.status).toBe('active');
    expect(result.current.secondsLeft).toBeGreaterThan(0);
  });

  it('transitions to expired after timeout fires', async () => {
    const expiryUnix = Math.floor(Date.now() / 1000) + 10;
    const { result, waitForNextUpdate } = renderHook(() =>
      useHTLCExpiry('order-002', expiryUnix, false)
    );

    await act(async () => {
      jest.advanceTimersByTime(11_000);
      await waitForNextUpdate();
    });

    expect(markOrderExpired).toHaveBeenCalledWith('order-002');
    expect(result.current.status).toBe('expired');
    expect(result.current.copyLine).toBe(HTLC_COPY.expired);
    expect(result.current.secondsLeft).toBeNull();
  });

  it('transitions to fulfilled immediately when isFulfilled = true', () => {
    const expiryUnix = Math.floor(Date.now() / 1000) + 480;
    const { result, rerender } = renderHook(
      ({ fulfilled }) => useHTLCExpiry('order-003', expiryUnix, fulfilled),
      { initialProps: { fulfilled: false } }
    );

    act(() => {
      rerender({ fulfilled: true });
    });

    expect(result.current.status).toBe('fulfilled');
    expect(result.current.copyLine).toBe(HTLC_COPY.fulfilled);
    expect(result.current.secondsLeft).toBeNull();
    expect(markOrderExpired).not.toHaveBeenCalled();
  });

  it('does not fire expiry timer when isFulfilled is already true', () => {
    const expiryUnix = Math.floor(Date.now() / 1000) + 10;
    renderHook(() => useHTLCExpiry('order-004', expiryUnix, true));

    act(() => jest.advanceTimersByTime(15_000));

    expect(markOrderExpired).not.toHaveBeenCalled();
  });

  it('surfaces error status when markOrderExpired throws', async () => {
    (markOrderExpired as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

    const expiryUnix = Math.floor(Date.now() / 1000) + 5;
    const { result, waitForNextUpdate } = renderHook(() =>
      useHTLCExpiry('order-005', expiryUnix, false)
    );

    await act(async () => {
      jest.advanceTimersByTime(6_000);
      await waitForNextUpdate();
    });

    expect(result.current.status).toBe('error');
    expect(result.current.copyLine).toBe(HTLC_COPY.error);
  });

  it('null orderId and expiryUnix — stays active, no timer', () => {
    const { result } = renderHook(() =>
      useHTLCExpiry(null, null, false)
    );
    act(() => jest.advanceTimersByTime(60_000));
    expect(result.current.status).toBe('active');
    expect(markOrderExpired).not.toHaveBeenCalled();
  });
});

describe('HTLC_COPY', () => {
  it('all statuses have copy defined', () => {
    expect(HTLC_COPY.fulfilled).toBeTruthy();
    expect(HTLC_COPY.expired).toBeTruthy();
    expect(HTLC_COPY.error).toBeTruthy();
  });

  it('locked copy string matches spec', () => {
    expect(HTLC_COPY.expired).toBe('Sats returning to your wallet.');
    expect(HTLC_COPY.fulfilled).toBe('Order confirmed — see you at the counter.');
  });
});
