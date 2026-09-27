import { composeFeedbackEmail, containsCprNumber } from '../composeFeedback';

const environment = {
  appName: 'Phrenico',
  appVersion: '0.1.0',
  contentVersion: 'abc123',
  contentKind: 'approved' as const,
  platform: 'ios 18',
};

describe('composeFeedbackEmail', () => {
  it('fills in the page and technical info so errors can be traced', () => {
    const email = composeFeedbackEmail({
      to: 'udvikler@example.com',
      type: 'content-error',
      message: '  Der er en tastefejl.  ',
      context: { kind: 'formula', id: 'test-formel', title: 'Testformel', version: 3 },
      environment,
    });
    expect(email.subject).toBe('Phrenico – Fejl i indhold – Formel: Testformel');
    expect(email.body).toBe(
      [
        'Der er en tastefejl.',
        '',
        '—',
        'Teknisk info (udfyldt automatisk):',
        'App: Phrenico 0.1.0',
        'Indhold: abc123',
        'Side: formel "test-formel", version 3',
        'Platform: ios 18',
      ].join('\n'),
    );
    expect(email.url.startsWith('mailto:udvikler%40example.com?subject=')).toBe(true);
    expect(decodeURIComponent(email.url.split('&body=')[1] ?? '')).toBe(email.body);
  });

  it('marks feedback sent from demo content', () => {
    const email = composeFeedbackEmail({ to: 'a@b.dk', type: 'other', message: 'x', environment: { ...environment, contentKind: 'demo' } });
    expect(email.body).toContain('Indhold: abc123 (DEMO)');
    expect(email.subject).toBe('Phrenico – Andet');
  });
});

describe('containsCprNumber', () => {
  it.each(['010203-1234', '0102031234', 'CPR 010203 1234 her', '311299-0001'])('detects %p', (text) => {
    expect(containsCprNumber(text)).toBe(true);
  });

  it.each(['12345', '320199-1234', '011399-1234', 'tlf 12345678', 'version 0.1.0', '12,5 enhed', '01020312345'])(
    'does not flag %p',
    (text) => {
      expect(containsCprNumber(text)).toBe(false);
    },
  );
});
