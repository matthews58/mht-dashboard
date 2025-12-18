export interface WpAppConfig {
  restUrl: string;
  nonce: string;
}

export function getWpConfig(): WpAppConfig {
  const win = window as any;

  if (win.MHTData) {
    return win.MHTData;
  }

  return {
    restUrl: 'http://morrishockeytraining.local/wp-json/mht-dashboard/v1',
    nonce: '',
  };
}
