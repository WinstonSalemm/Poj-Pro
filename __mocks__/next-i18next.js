// Mock for next-i18next
const useTranslation = () => ({
  t: (key) => key, // Return the key as the translation
  i18n: {
    language: 'en',
    changeLanguage: jest.fn(),
  },
});

const appWithTranslation = (component) => component;

const withTranslation = () => (Component) => {
  const WithTranslation = (props) => (
    <Component t={(k) => k} {...props} />
  );
  WithTranslation.displayName = `WithTranslation(${Component.displayName || Component.name || 'Component'})`;
  return WithTranslation;
};

module.exports = {
  useTranslation,
  appWithTranslation,
  withTranslation,
};
