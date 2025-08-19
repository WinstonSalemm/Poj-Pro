import 'i18next';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: {
        aboutus: {
          title: string;
          subtitle: string;
          more: string;
          welcome: string;
          mission: string;
          suppliers: {
            title: string;
            description: string;
          };
          reasons: {
            first: { title: string; text: string };
            delivery: { title: string; text: string };
            stock: { title: string; text: string };
            honest: { title: string; text: string };
            support: { title: string; text: string };
            stability: { title: string; text: string };
          };
          contacts: {
            title: string;
            address: string;
            addressValue: string;
            phone: string;
            phoneValue: string;
            email: string;
            emailValue: string;
            hours: string;
            hoursValue: string;
          };
        };
        // Add other translation keys as needed
      };
    };
  }
}
