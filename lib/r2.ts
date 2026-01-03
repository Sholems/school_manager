import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Initialize R2 client
const r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
})

const BUCKET_NAME = process.env.R2_BUCKET_NAME!
const PUBLIC_URL = process.env.R2_PUBLIC_URL!

/**
 * Upload a file to Cloudflare R2
 */
export async function uploadToR2(
    file: Buffer,
    key: string,
    contentType: string
): Promise<string> {
    await r2Client.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: file,
        ContentType: contentType,
    }))

    return `${PUBLIC_URL}/${key}`
}

/**
 * Upload a Base64 encoded file to R2
 */
export async function uploadBase64ToR2(
    base64Data: string,
    key: string,
    contentType: string
): Promise<string> {
    // Remove data URL prefix if present (e.g., "data:image/png;base64,")
    const base64Content = base64Data.includes(',')
        ? base64Data.split(',')[1]
        : base64Data

    const buffer = Buffer.from(base64Content, 'base64')
    return uploadToR2(buffer, key, contentType)
}

/**
 * Delete a file from R2
 */
export async function deleteFromR2(key: string): Promise<void> {
    await r2Client.send(new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    }))
}

/**
 * Generate a presigned URL for secure uploads
 */
export async function getPresignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn: number = 3600
): Promise<string> {
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: contentType,
    })

    return getSignedUrl(r2Client, command, { expiresIn })
}

/**
 * Generate a unique file key for storage
 */
export function generateFileKey(
    folder: string,
    fileName: string,
    schoolId?: string
): string {
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')

    if (schoolId) {
        return `${schoolId}/${folder}/${timestamp}-${randomSuffix}-${sanitizedName}`
    }
    return `${folder}/${timestamp}-${randomSuffix}-${sanitizedName}`
}

/**
 * Extract the key from a full R2 URL
 */
export function extractKeyFromUrl(url: string): string | null {
    if (!url.startsWith(PUBLIC_URL)) return null
    return url.replace(`${PUBLIC_URL}/`, '')
}
