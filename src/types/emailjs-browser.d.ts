declare module '@emailjs/browser' {
  export function init(userID: string): void;
  export function sendForm(
    serviceID: string,
    templateID: string,
    form: HTMLFormElement,
    publicKey?: string
  ): Promise<{ status: number; text: string }>;
}
