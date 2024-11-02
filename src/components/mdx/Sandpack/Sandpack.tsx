import cn from '@/lib/cn'
import { crawl } from '@/utils/docs'
import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
  type SandpackFiles,
  type SandpackProviderProps,
} from '@codesandbox/sandpack-react'
import fs from 'node:fs'
import path from 'node:path'

// https://tailwindcss.com/docs/configuration#referencing-in-java-script
import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from '../../../../tailwind.config'
const fullConfig = resolveConfig(tailwindConfig)
// console.log('fullConfig', fullConfig.theme.colors)
// console.log(fullConfig.theme.fontSize.sm)
// console.log(fullConfig.theme.fontFamily.mono)

function getSandpackDependencies(folder: string) {
  const pkgPath = `${folder}/package.json`
  if (!fs.existsSync(pkgPath)) return null

  const str = fs.readFileSync(pkgPath, 'utf-8')
  return JSON.parse(str).dependencies as Record<string, string>
}

async function getSandpackFiles(
  folder: string,
  files: SandpackFiles = {},
  extensions = ['js', 'ts', 'jsx', 'tsx', 'css'],
) {
  const filepaths = await crawl(
    folder,
    (dir) =>
      !dir.includes('node_modules') && extensions.map((ext) => dir.endsWith(ext)).some(Boolean),
  )
  // console.log('filepaths', filepaths)

  return filepaths.reduce((acc, filepath) => {
    const relativeFilepath = path.relative(folder, filepath)

    const key = `/${relativeFilepath}`
    const file = files[key]
    return {
      ...acc,
      [key]: {
        ...((typeof file !== 'string' && file) || undefined),
        code: fs.readFileSync(filepath, 'utf-8'),
      },
    }
  }, {} as SandpackFiles)
}

// https://sandpack.codesandbox.io/docs/getting-started/usage
export const Sandpack = async ({
  className,
  folder,
  ...props
}: SandpackProviderProps & {
  className: string
  folder?: string
}) => {
  // console.log('folder', folder)

  const _files = folder ? await getSandpackFiles(folder, props.files) : props.files

  const pkgDeps = folder ? getSandpackDependencies(folder) : null
  const dependencies = pkgDeps ?? props.customSetup?.dependencies
  const customSetup = {
    ...props.customSetup,
    dependencies,
  }
  // console.log('customSetup', customSetup)

  const options = {
    ...props.options,
    // editorHeight: 350
  }

  return (
    <div className={cn(className, 'sandpack')}>
      <SandpackProvider
        {...props}
        theme={{
          colors: {
            // @ts-ignore
            surface1: fullConfig.theme.colors['inverse-surface-light'],
          },
          font: {
            mono: fullConfig.theme.fontFamily.mono.join(', '),
            size: fullConfig.theme.fontSize.xs[0],
          },
        }}
        files={_files}
        customSetup={customSetup}
        options={options}
      >
        <SandpackLayout>
          <SandpackCodeEditor />
          <SandpackPreview />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  )
}
