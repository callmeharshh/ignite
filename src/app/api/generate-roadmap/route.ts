import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { careerGoal, currentPhase } = body;

    // Validate required fields
    if (!careerGoal) {
      return NextResponse.json(
        { error: 'Career goal is required' },
        { status: 400 }
      );
    }

    // Generate a sample roadmap (you can replace this with AI generation later)
    const roadmap = generateSampleRoadmap(careerGoal, currentPhase);

    return NextResponse.json({ 
      roadmap,
      success: true 
    });

  } catch (error) {
    console.error('Error in generate-roadmap API:', error);
    return NextResponse.json(
      { error: 'Failed to generate roadmap' },
      { status: 500 }
    );
  }
}

function generateSampleRoadmap(careerGoal: string, currentPhase: string): string {
  return `# 6-Month Learning Roadmap for ${careerGoal}

## **Month 1: Foundation Building**
**Key Skills:** Programming Fundamentals, Problem Solving, Basic Tools
**Projects:** Hello World Project, Simple Calculator
**Tools:** VS Code, Git, Terminal
**Focus:** Build strong fundamentals and get comfortable with coding

## **Month 2: Core Technologies**
**Key Skills:** ${careerGoal === 'Software Engineer' ? 'JavaScript, HTML, CSS' : 'Data Analysis, Statistics, Python'}
**Projects:** ${careerGoal === 'Software Engineer' ? 'Personal Website, Todo App' : 'Data Visualization, Basic Analysis'}
**Tools:** ${careerGoal === 'Software Engineer' ? 'React, Node.js' : 'Pandas, Matplotlib, Jupyter'}
**Focus:** Master the core technologies for your field

## **Month 3: Advanced Concepts**
**Key Skills:** ${careerGoal === 'Software Engineer' ? 'React, APIs, Databases' : 'Machine Learning, SQL, Advanced Statistics'}
**Projects:** ${careerGoal === 'Software Engineer' ? 'Full-Stack App, API Integration' : 'ML Model, Database Analysis'}
**Tools:** ${careerGoal === 'Software Engineer' ? 'MongoDB, Express.js' : 'Scikit-learn, SQL, Advanced Python'}
**Focus:** Build complex projects and understand system architecture

## **Month 4: Specialization**
**Key Skills:** ${careerGoal === 'Software Engineer' ? 'Cloud Services, DevOps, Testing' : 'Deep Learning, Big Data, Advanced ML'}
**Projects:** ${careerGoal === 'Software Engineer' ? 'Deployed Web App, CI/CD Pipeline' : 'Deep Learning Model, Big Data Project'}
**Tools:** ${careerGoal === 'Software Engineer' ? 'AWS, Docker, Jest' : 'TensorFlow, Spark, Advanced Analytics'}
**Focus:** Specialize in your chosen area and learn industry best practices

## **Month 5: Real-World Application**
**Key Skills:** ${careerGoal === 'Software Engineer' ? 'System Design, Performance Optimization' : 'Production ML, Model Deployment, A/B Testing'}
**Projects:** ${careerGoal === 'Software Engineer' ? 'Scalable Application, Performance Testing' : 'Production ML Pipeline, Model Monitoring'}
**Tools:** ${careerGoal === 'Software Engineer' ? 'Redis, Load Balancing, Monitoring' : 'MLflow, Kubernetes, Monitoring Tools'}
**Focus:** Apply your skills to real-world problems and optimize for production

## **Month 6: Mastery & Portfolio**
**Key Skills:** ${careerGoal === 'Software Engineer' ? 'Architecture Patterns, Code Review, Mentoring' : 'Advanced Analytics, Business Intelligence, Leadership'}
**Projects:** ${careerGoal === 'Software Engineer' ? 'Open Source Contribution, Complex System' : 'End-to-End Analytics Platform, Business Impact Project'}
**Tools:** ${careerGoal === 'Software Engineer' ? 'Advanced Frameworks, Code Quality Tools' : 'Advanced BI Tools, Business Analytics Platforms'}
**Focus:** Demonstrate mastery and build a strong portfolio for job applications

## **Success Metrics:**
- Complete at least 3 major projects
- Contribute to open source or community
- Build a professional portfolio
- Network with industry professionals
- Apply for internships or entry-level positions

## **Next Steps:**
1. Set up your development environment
2. Join relevant communities and forums
3. Start building projects immediately
4. Document your learning journey
5. Seek feedback and mentorship

Remember: Consistency is key! Spend 2-3 hours daily on learning and building projects.`;
}
