/**
 * Dynamic Programming Study Plan Optimizer
 * Uses a knapsack-like approach to optimize study time allocation
 */

function calculateDifficulty(topic, studentData) {
  const attendance = studentData.attendance || 75;
  const internalMarks = studentData.internalMarks || 50;
  const assignmentMarks = studentData.assignmentMarks || 50;
  
  const performanceScore = (100 - ((attendance + internalMarks + assignmentMarks) / 3));
  const topicHash = topic.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const topicDifficulty = (topicHash % 30) + 40;
  
  return Math.min(100, Math.round((performanceScore * 0.6) + (topicDifficulty * 0.4)));
}

function calculateImpact(topic, studentData) {
  const passProb = studentData.passProb || 0.5;
  const passProbImpact = (1 - passProb) * 100;
  const topicHash = topic.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const topicWeight = (topicHash % 40) + 60;
  
  return Math.min(100, Math.round((passProbImpact * 0.5) + (topicWeight * 0.5)));
}

function estimateStudyHours(difficulty) {
  return Math.max(2, Math.min(10, Math.round((difficulty / 100) * 8 + 2)));
}

function knapsackDP(subjects, totalHours) {
  const n = subjects.length;
  const dp = Array(n + 1).fill(null).map(() => Array(totalHours + 1).fill(0));
  
  for (let i = 1; i <= n; i++) {
    const subject = subjects[i - 1];
    const hours = subject.hours;
    const impact = subject.impact;
    
    for (let w = 0; w <= totalHours; w++) {
      dp[i][w] = dp[i - 1][w];
      if (w >= hours) {
        dp[i][w] = Math.max(dp[i][w], dp[i - 1][w - hours] + impact);
      }
    }
  }
  
  const selectedSubjects = [];
  let w = totalHours;
  
  for (let i = n; i > 0; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      selectedSubjects.push(subjects[i - 1]);
      w -= subjects[i - 1].hours;
    }
  }
  
  return selectedSubjects.reverse();
}

function getDailyGoal(subject) {
  const goals = {
    high: ['Complete 2 practice problems', 'Review lecture notes', 'Watch tutorial video', 'Solve past exam questions'],
    medium: ['Read chapter summary', 'Complete 1 practice problem', 'Review key concepts', 'Create flashcards'],
    low: ['Quick review session', 'Practice basic concepts', 'Read study materials', 'Take short quiz']
  };
  
  const difficulty = subject.difficulty;
  let level = 'low';
  if (difficulty > 70) level = 'high';
  else if (difficulty > 50) level = 'medium';
  
  const goalList = goals[level];
  const hash = subject.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return goalList[hash % goalList.length];
}

function generateRecommendations(subjects, totalHours, availableHours) {
  const recommendations = [];
  
  if (subjects.length === 0) {
    recommendations.push('No subjects selected. Consider increasing available study hours.');
    return recommendations;
  }
  
  const topPriority = subjects[0];
  recommendations.push(`Focus on "${topPriority.name}" first - highest impact potential (${topPriority.impact}/100)`);
  
  if (totalHours < availableHours * 0.8) {
    recommendations.push(`You have ${availableHours - totalHours} extra hours - consider adding more practice time`);
  } else {
    recommendations.push('Study plan is well-optimized for your available time');
  }
  
  const highDifficultyCount = subjects.filter(s => s.difficulty > 70).length;
  if (highDifficultyCount > 0) {
    recommendations.push(`${highDifficultyCount} challenging topic(s) - consider seeking tutor help`);
  }
  
  if (subjects.length > 3) {
    recommendations.push('Break study sessions into 45-min blocks with 10-min breaks');
  } else {
    recommendations.push('Use spaced repetition technique for better retention');
  }
  
  return recommendations;
}

function generateWeeklySchedule(subjects) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const schedule = {};
  
  days.forEach(day => {
    schedule[day] = [];
  });
  
  subjects.forEach((subject, index) => {
    const hoursNeeded = subject.hours;
    const sessionsNeeded = Math.ceil(hoursNeeded / 2);
    
    for (let i = 0; i < sessionsNeeded && i < 7; i++) {
      const dayIndex = (index + i * 2) % 7;
      const sessionHours = Math.min(2, hoursNeeded - (i * 2));
      
      if (sessionHours > 0) {
        schedule[days[dayIndex]].push({
          subject: subject.name,
          hours: sessionHours,
          priority: subject.priority,
          goal: subject.dailyGoal
        });
      }
    }
  });
  
  return schedule;
}

export function generateOptimizedStudyPlan(studentData, weakTopics, availableHours = 20) {
  if (!weakTopics || weakTopics.length === 0) {
    return {
      subjects: [],
      totalHours: 0,
      totalImpact: 0,
      efficiency: 0,
      recommendations: ['No weak topics identified. Keep up the good work!']
    };
  }
  
  const subjects = weakTopics.map(topic => {
    const difficulty = calculateDifficulty(topic, studentData);
    const impact = calculateImpact(topic, studentData);
    const hours = estimateStudyHours(difficulty);
    
    return {
      name: topic,
      difficulty,
      impact,
      hours,
      impactPerHour: impact / hours
    };
  });
  
  subjects.sort((a, b) => b.impactPerHour - a.impactPerHour);
  
  const selectedSubjects = knapsackDP(subjects, availableHours);
  
  const totalHours = selectedSubjects.reduce((sum, s) => sum + s.hours, 0);
  const totalImpact = selectedSubjects.reduce((sum, s) => sum + s.impact, 0);
  const maxPossibleImpact = subjects.reduce((sum, s) => sum + s.impact, 0);
  const efficiency = maxPossibleImpact > 0 ? (totalImpact / maxPossibleImpact) * 100 : 0;
  
  const prioritizedSubjects = selectedSubjects.map((subject, index) => ({
    ...subject,
    priority: index + 1,
    priorityScore: subject.impact * (subject.difficulty / 100),
    hoursPerDay: (subject.hours / 7).toFixed(1),
    dailyGoal: getDailyGoal(subject)
  })).sort((a, b) => b.priorityScore - a.priorityScore);
  
  const recommendations = generateRecommendations(prioritizedSubjects, totalHours, availableHours);
  const weeklySchedule = generateWeeklySchedule(prioritizedSubjects);
  
  return {
    subjects: prioritizedSubjects,
    totalHours,
    totalImpact: Math.round(totalImpact),
    efficiency: Math.round(efficiency),
    recommendations,
    weeklySchedule,
    unusedHours: availableHours - totalHours
  };
}

export function calculateStudyPlanMetrics(studyPlan) {
  if (!studyPlan || !studyPlan.subjects || studyPlan.subjects.length === 0) {
    return {
      coverage: 0,
      intensity: 0,
      balance: 0,
      overall: 0
    };
  }
  
  const { subjects, totalHours, efficiency } = studyPlan;
  
  const coverage = efficiency;
  const avgHoursPerSubject = totalHours / subjects.length;
  const intensity = Math.min(100, (avgHoursPerSubject / 5) * 100);
  
  const hourVariance = subjects.reduce((sum, s) => {
    const diff = s.hours - avgHoursPerSubject;
    return sum + (diff * diff);
  }, 0) / subjects.length;
  const balance = Math.max(0, 100 - (hourVariance * 10));
  
  const overall = (coverage * 0.4 + intensity * 0.3 + balance * 0.3);
  
  return {
    coverage: Math.round(coverage),
    intensity: Math.round(intensity),
    balance: Math.round(balance),
    overall: Math.round(overall)
  };
}
