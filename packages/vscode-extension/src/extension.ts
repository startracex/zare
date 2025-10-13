import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  // Your existing activation code here...

  // Configure Tailwind CSS for Zare files
  configureTailwindForZare();

  console.log('Zare extension activated with Tailwind CSS support');
}

export function deactivate() {}

async function configureTailwindForZare() {
  try {
    const config = vscode.workspace.getConfiguration('tailwindCSS');
    const includeLanguages =
      (config.get('includeLanguages') as Record<string, string>) || {};

    // Check if zare is already configured
    if (!includeLanguages['zare']) {
      // Add zare to includeLanguages
      includeLanguages['zare'] = 'html';

      // Update the configuration
      await config.update(
        'includeLanguages',
        includeLanguages,
        vscode.ConfigurationTarget.Global,
      );

      // Show a notification to the user
      vscode.window.showInformationMessage(
        "Zare extension configured Tailwind CSS support. Restart VS Code if Tailwind suggestions don't appear immediately.",
      );
    }
  } catch (error) {
    console.error('Failed to configure Tailwind CSS for Zare:', error);

    // Fallback: show manual configuration instructions
    const action = await vscode.window.showWarningMessage(
      'Could not automatically configure Tailwind CSS. Would you like to see manual setup instructions?',
      'Show Instructions',
    );

    if (action === 'Show Instructions') {
      vscode.env.openExternal(
        vscode.Uri.parse(
          'https://github.com/IsmailBinMujeeb/zare-vs-code-extension#tailwind-css-support',
        ),
      );
    }
  }
}
