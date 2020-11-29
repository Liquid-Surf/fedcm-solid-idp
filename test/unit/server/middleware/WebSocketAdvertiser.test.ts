import { createResponse } from 'node-mocks-http';
import { WebSocketAdvertiser } from '../../../../src/server/middleware/WebSocketAdvertiser';

describe('A WebSocketAdvertiser', (): void => {
  it('writes a default HTTP WebSocket.', async(): Promise<void> => {
    const writer = new WebSocketAdvertiser();
    const response = createResponse();
    await writer.handle({ response } as any);
    expect(response.getHeaders()).toEqual({ 'updates-via': 'ws://localhost/' });
  });

  it('writes an HTTP WebSocket with port 80.', async(): Promise<void> => {
    const writer = new WebSocketAdvertiser({ hostname: 'test.example', port: 80, protocol: 'http' });
    const response = createResponse();
    await writer.handle({ response } as any);
    expect(response.getHeaders()).toEqual({ 'updates-via': 'ws://test.example/' });
  });

  it('writes an HTTP WebSocket with port 3000.', async(): Promise<void> => {
    const writer = new WebSocketAdvertiser({ hostname: 'test.example', port: 3000, protocol: 'http' });
    const response = createResponse();
    await writer.handle({ response } as any);
    expect(response.getHeaders()).toEqual({ 'updates-via': 'ws://test.example:3000/' });
  });

  it('writes an HTTPS WebSocket with port 443.', async(): Promise<void> => {
    const writer = new WebSocketAdvertiser({ hostname: 'test.example', port: 443, protocol: 'https' });
    const response = createResponse();
    await writer.handle({ response } as any);
    expect(response.getHeaders()).toEqual({ 'updates-via': 'wss://test.example/' });
  });

  it('rejects an invalid hostname.', (): void => {
    expect((): any => new WebSocketAdvertiser({ hostname: 'test.example/invalid' }))
      .toThrow('Invalid hostname: test.example/invalid');
  });
});
