#!/usr/bin/env node

// Generate comprehensive webpack aliases for all @/ imports
const fs = require('fs')
const path = require('path')

console.log('🔧 Generating Webpack Aliases for Module Resolution\n')

function findTsxTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir)
  
  files.forEach(file => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      findTsxTsFiles(filePath, fileList)
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath)
    }
  })
  
  return fileList
}

function extractImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const importRegex = /import.*from\s+['"](@\/[^'"]+)['"]/g
    const imports = []
    let match
    
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1])
    }
    
    return imports
  } catch (error) {
    return []
  }
}

function generateAliases() {
  const srcFiles = findTsxTsFiles('./src')
  const allImports = new Set()
  
  // Collect all @/ imports
  srcFiles.forEach(file => {
    const imports = extractImports(file)
    imports.forEach(imp => allImports.add(imp))
  })
  
  console.log(`Found ${allImports.size} unique @/ imports:\n`)
  
  const aliases = {}
  const missingFiles = []
  
  Array.from(allImports).sort().forEach(importPath => {
    // Convert @/path to actual file path
    const relativePath = importPath.replace('@/', './src/')
    
    // Try different extensions
    const possibleFiles = [
      `${relativePath}.tsx`,
      `${relativePath}.ts`,
      `${relativePath}/index.tsx`,
      `${relativePath}/index.ts`,
      relativePath // if it already has extension
    ]
    
    let resolvedPath = null
    for (const filePath of possibleFiles) {
      if (fs.existsSync(filePath)) {
        resolvedPath = filePath
        break
      }
    }
    
    if (resolvedPath) {
      console.log(`✅ ${importPath} -> ${resolvedPath}`)
      aliases[importPath] = `require.resolve('${resolvedPath}')`
    } else {
      console.log(`❌ ${importPath} -> NOT FOUND`)
      missingFiles.push(importPath)
    }
  })
  
  console.log('\n📝 Generated webpack aliases:')
  console.log('config.resolve.alias = {')
  console.log('  ...config.resolve.alias,')
  Object.entries(aliases).forEach(([key, value]) => {
    console.log(`  '${key}': ${value},`)
  })
  console.log('}')
  
  if (missingFiles.length > 0) {
    console.log('\n⚠️  Missing files that need to be created:')
    missingFiles.forEach(file => console.log(`  ${file}`))
  }
  
  return { aliases, missingFiles }
}

generateAliases()