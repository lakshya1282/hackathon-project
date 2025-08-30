# Create Sample Data for Blog Platform

# Create first user (admin)
Write-Host "Creating admin user..."
$adminUser = @{
    username = "admin"
    email = "admin@example.com" 
    password = "admin123"
} | ConvertTo-Json

$adminResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $adminUser -ContentType "application/json"
$adminToken = $adminResponse.token
Write-Host "Admin user created with token: $($adminToken.Substring(0,20))..."

# Create second user (regular user)
Write-Host "Creating regular user..."
$regularUser = @{
    username = "johndoe"
    email = "john@example.com"
    password = "password123"
} | ConvertTo-Json

$userResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $regularUser -ContentType "application/json"
$userToken = $userResponse.token
Write-Host "Regular user created with token: $($userToken.Substring(0,20))..."

# Create third user
Write-Host "Creating another user..."
$user2 = @{
    username = "janedoe"
    email = "jane@example.com"
    password = "password123"
} | ConvertTo-Json

$user2Response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $user2 -ContentType "application/json"
$user2Token = $user2Response.token
Write-Host "Second user created with token: $($user2Token.Substring(0,20))..."

# Create blog posts
Write-Host "Creating blog posts..."

# Blog 1 by admin
$blog1 = @{
    title = "Getting Started with React"
    content = "React is a popular JavaScript library for building user interfaces. In this comprehensive guide, we'll explore the fundamentals of React and how to build your first React application. React was created by Facebook and has gained massive adoption in the developer community due to its component-based architecture and virtual DOM implementation. This makes it perfect for building dynamic and interactive web applications."
    excerpt = "Learn the basics of React and build your first application"
    tags = @("React", "JavaScript", "Frontend", "Tutorial")
    category = "Technology"
    featuredImage = "https://images.unsplash.com/photo-1633356122544-f134324a6cee"
} | ConvertTo-Json -Depth 10

$headers1 = @{
    "Authorization" = "Bearer $adminToken"
    "Content-Type" = "application/json"
}

$blogResponse1 = Invoke-RestMethod -Uri "http://localhost:5000/api/blogs" -Method POST -Body $blog1 -Headers $headers1
Write-Host "Blog 1 created: $($blogResponse1.title)"

# Blog 2 by regular user
$blog2 = @{
    title = "The Future of Web Development"
    content = "Web development is constantly evolving with new technologies and frameworks emerging regularly. In this article, we'll discuss the current trends and what the future holds for web developers. From progressive web apps to serverless architecture, the landscape is changing rapidly. Developers need to stay updated with the latest technologies while maintaining focus on user experience and performance optimization."
    excerpt = "Exploring current trends and future directions in web development"
    tags = @("Web Development", "Technology", "Future", "Trends")
    category = "Technology"
    featuredImage = "https://images.unsplash.com/photo-1460925895917-afdab827c52f"
} | ConvertTo-Json -Depth 10

$headers2 = @{
    "Authorization" = "Bearer $userToken"
    "Content-Type" = "application/json"
}

$blogResponse2 = Invoke-RestMethod -Uri "http://localhost:5000/api/blogs" -Method POST -Body $blog2 -Headers $headers2
Write-Host "Blog 2 created: $($blogResponse2.title)"

# Blog 3 by jane
$blog3 = @{
    title = "Building Scalable Node.js Applications"
    content = "Node.js has revolutionized server-side JavaScript development. This article covers best practices for building scalable and maintainable Node.js applications. We'll discuss architecture patterns, performance optimization techniques, and security considerations. Whether you're building APIs, microservices, or full-stack applications, these principles will help you create robust solutions that can handle production workloads."
    excerpt = "Best practices for scalable Node.js development"
    tags = @("Node.js", "Backend", "Scalability", "JavaScript")
    category = "Technology"
    featuredImage = "https://images.unsplash.com/photo-1555949963-aa79dcee981c"
} | ConvertTo-Json -Depth 10

$headers3 = @{
    "Authorization" = "Bearer $user2Token"
    "Content-Type" = "application/json"
}

$blogResponse3 = Invoke-RestMethod -Uri "http://localhost:5000/api/blogs" -Method POST -Body $blog3 -Headers $headers3
Write-Host "Blog 3 created: $($blogResponse3.title)"

# Blog 4 by admin - lifestyle category
$blog4 = @{
    title = "The Art of Work-Life Balance in Tech"
    content = "Working in the technology industry can be demanding, with tight deadlines and constantly changing requirements. Finding the right work-life balance is crucial for long-term success and personal well-being. In this article, we'll explore strategies for managing stress, setting boundaries, and maintaining productivity while ensuring you have time for personal interests and relationships. Remote work has added new challenges and opportunities in this area."
    excerpt = "Strategies for maintaining work-life balance in the tech industry"
    tags = @("Work-Life Balance", "Career", "Productivity", "Mental Health")
    category = "Other"
    featuredImage = "https://images.unsplash.com/photo-1551836022-deb4988cc6c0"
} | ConvertTo-Json -Depth 10

$blogResponse4 = Invoke-RestMethod -Uri "http://localhost:5000/api/blogs" -Method POST -Body $blog4 -Headers $headers1
Write-Host "Blog 4 created: $($blogResponse4.title)"

# Blog 5 by john - travel category  
$blog5 = @{
    title = "Digital Nomad Guide: Working While Traveling"
    content = "The rise of remote work has opened up new possibilities for combining travel with professional life. Being a digital nomad requires careful planning, reliable internet connections, and the right tools and mindset. In this comprehensive guide, we'll cover everything from choosing destinations and finding accommodation to managing time zones and staying productive on the road. We'll also discuss the challenges and benefits of this lifestyle choice."
    excerpt = "Complete guide to working remotely while traveling the world"
    tags = @("Digital Nomad", "Remote Work", "Travel", "Lifestyle")
    category = "Other"
    featuredImage = "https://images.unsplash.com/photo-1488646953014-85cb44e25828"
} | ConvertTo-Json -Depth 10

$blogResponse5 = Invoke-RestMethod -Uri "http://localhost:5000/api/blogs" -Method POST -Body $blog5 -Headers $headers2
Write-Host "Blog 5 created: $($blogResponse5.title)"

Write-Host "Sample data creation completed!"
Write-Host "Note: All blogs are created with 'pending' status and need admin approval to be visible"
