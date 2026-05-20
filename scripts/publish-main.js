const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const ExpoConfig = require('@expo/config');

const projectRootDir = path.resolve(__dirname, '..', '..', '..');
const serverDir = path.resolve(__dirname, '..');

function publish() {
  console.log('Starting export process for the main app...');
  console.log(`Project root directory: ${projectRootDir}`);

  const args = process.argv.slice(2);
  const isAndroidOnly = args.includes('--android');
  const isIosOnly = args.includes('--ios');
  
  let platformArgs = '--platform android --platform ios';
  if (isAndroidOnly) platformArgs = '--platform android';
  if (isIosOnly) platformArgs = '--platform ios';

  // 1. Run npx expo export for selected platforms
  try {
    execSync(`npx expo export ${platformArgs}`, {
      cwd: projectRootDir,
      stdio: 'inherit',
    });
  } catch (error) {
    console.error('Failed to export the app via expo-cli:', error);
    process.exit(1);
  }

  // 2. Fetch the Expo config for the main app
  let exp;
  try {
    const configResult = ExpoConfig.getConfig(projectRootDir, {
      skipSDKVersionRequirement: true,
      isPublicConfig: true,
    });
    exp = configResult.exp;
  } catch (error) {
    console.error('Failed to get Expo configuration:', error);
    process.exit(1);
  }

  // 3. Extract runtime versions
  const runtimeVersions = new Set();
  if (exp.runtimeVersion) {
    runtimeVersions.add(exp.runtimeVersion);
  }
  if (exp.android && exp.android.runtimeVersion) {
    runtimeVersions.add(exp.android.runtimeVersion);
  }
  if (exp.ios && exp.ios.runtimeVersion) {
    runtimeVersions.add(exp.ios.runtimeVersion);
  }

  if (runtimeVersions.size === 0) {
    console.error('Error: No runtimeVersion found in app.json. Please define expo.runtimeVersion, expo.android.runtimeVersion, or expo.ios.runtimeVersion.');
    process.exit(1);
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const sourceDistDir = path.join(projectRootDir, 'dist');

  if (!fs.existsSync(sourceDistDir)) {
    console.error(`Error: Exported directory not found at ${sourceDistDir}`);
    process.exit(1);
  }

  // 4. For each runtime version, copy the dist directory to the server
  for (const runtimeVersion of runtimeVersions) {
    const destUpdatesDir = path.join(serverDir, 'updates', runtimeVersion, timestamp);
    console.log(`Publishing update for runtime version "${runtimeVersion}" to: ${destUpdatesDir}`);

    try {
      // Create destination directory
      fs.mkdirSync(destUpdatesDir, { recursive: true });

      // Copy all contents from dist to server updates directory
      fs.cpSync(sourceDistDir, destUpdatesDir, { recursive: true });

      // Write client config to the server updates directory as expoConfig.json
      fs.writeFileSync(
        path.join(destUpdatesDir, 'expoConfig.json'),
        JSON.stringify(exp, null, 2),
        'utf8'
      );

      console.log(`Successfully published update for runtime version "${runtimeVersion}"!`);
    } catch (error) {
      console.error(`Failed to publish update for runtime version "${runtimeVersion}":`, error);
      process.exit(1);
    }
  }

  console.log('\nAll updates published successfully to the custom update server!');
}

publish();
