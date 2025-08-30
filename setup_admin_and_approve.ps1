# Setup Admin and Approve Blogs

# First, let's manually update the admin user's role in the database
Write-Host "Need to manually promote admin user to admin role in MongoDB..."
Write-Host "Connecting to MongoDB to update user role..."

# For now, let's get the pending blogs and their IDs so we can approve them
Write-Host "Logging in as admin (even though role may not be admin yet)..."
$adminLogin = @{
    email = "admin@example.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $adminResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $adminLogin -ContentType "application/json"
    $adminToken = $adminResponse.token
    Write-Host "Admin logged in successfully"
    
    # Try to get admin dashboard (this will fail if user is not admin)
    $headers = @{
        "Authorization" = "Bearer $adminToken"
        "Content-Type" = "application/json"
    }
    
    try {
        $dashboard = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/dashboard" -Method GET -Headers $headers
        Write-Host "Admin access confirmed. Dashboard stats:"
        Write-Host "Total Blogs: $($dashboard.stats.totalBlogs)"
        Write-Host "Pending Blogs: $($dashboard.stats.pendingBlogs)"
        Write-Host "Approved Blogs: $($dashboard.stats.approvedBlogs)"
        Write-Host "Total Users: $($dashboard.stats.totalUsers)"
        
        # Get all pending blogs
        $pendingBlogs = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/blogs?status=pending" -Method GET -Headers $headers
        
        Write-Host "Approving all pending blogs..."
        foreach ($blog in $pendingBlogs.blogs) {
            try {
                $approveResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/blogs/$($blog._id)/approve" -Method PUT -Headers $headers
                Write-Host "Approved blog: $($blog.title)"
            } catch {
                Write-Host "Failed to approve blog: $($blog.title) - Error: $($_.Exception.Message)"
            }
        }
        
    } catch {
        Write-Host "Admin access denied. Need to promote user to admin role first."
        Write-Host "Error: $($_.Exception.Message)"
    }
    
} catch {
    Write-Host "Login failed: $($_.Exception.Message)"
}

Write-Host "Process completed!"
