module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@/components': './src/components',
            '@/screens': './src/screens',
            '@/offline': './src/offline',
            '@/services': './src/services',
            '@/models': './src/models',
            '@/store': './src/store',
            '@/utils': './src/utils',
            '@/theme': './src/theme',
            '@/navigation': './src/navigation',
            '@/i18n': './src/i18n',
            '@/config': './src/config',
            '@/notifications': './src/notifications', // ⬅️ add this
          },
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        },
      ],
      'react-native-reanimated/plugin', // must be last
    ],
  };
};
