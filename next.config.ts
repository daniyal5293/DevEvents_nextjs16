const nextConfig = {
    typescript: {
        ignoreBuildErrors: true,
    },
    cacheComponents: true,
    images : {
        remotePatterns : [
            {
                protocol : 'https',
                hostname : 'res.cloudinary.com',
            }
        ]
    },
    reactCompiler:true,
    experimental: {
        turbopackFileSystemCacheForDev: true,
    },
};

export default nextConfig;
