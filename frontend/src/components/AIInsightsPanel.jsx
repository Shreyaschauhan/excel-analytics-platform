"use client"

import { useState } from "react"
import {
  Brain,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  Target,
  Flag,
  Zap,
  Award,
  BarChart,
} from "lucide-react"

const AIInsightsPanel = ({ aiInsights, loading }) => {
  const [activeTab, setActiveTab] = useState("overview")

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Brain className="h-5 w-5 text-blue-600 animate-pulse" />
          <h3 className="text-lg font-medium text-gray-900">Smart Analytics</h3>
        </div>
        <div className="space-y-3">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mt-2"></div>
          </div>
          <div className="text-center text-sm text-gray-500 mt-4">
            Generating professional insights... This may take a moment.
          </div>
        </div>
      </div>
    )
  }

  if (!aiInsights) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Brain className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">Smart Analytics</h3>
        </div>
        <div className="text-center py-8">
          <BarChart className="mx-auto h-12 w-12 text-gray-400" />
          <h4 className="mt-2 text-sm font-medium text-gray-900">No insights available</h4>
          <p className="mt-1 text-sm text-gray-500">Generate insights to see professional data analysis</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: "overview", name: "Overview", icon: TrendingUp },
    { id: "business", name: "Business", icon: Target },
    { id: "quality", name: "Data Quality", icon: CheckCircle },
    { id: "next", name: "Next Steps", icon: ArrowRight },
  ]

  const isInternal = aiInsights.source === "internal"
  const isEnhanced = aiInsights.model === "enhanced-analytics-engine"

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Professional Analytics Engine</h3>
            <div className="flex items-center space-x-2">
              <Award className="h-4 w-4 text-gold-500" />
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {isEnhanced ? "Enhanced Analytics" : "Smart Analysis"}
              </span>
              {aiInsights.confidence && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {aiInsights.confidence} confidence
                </span>
              )}
            </div>
          </div>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Generated on {new Date(aiInsights.generatedAt).toLocaleString()}
          {isEnhanced && (
            <span className="ml-2 text-blue-600">• Advanced statistical analysis with business intelligence</span>
          )}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                <Lightbulb className="h-4 w-4 mr-2" />
                Key Findings
              </h4>
              {aiInsights.structuredInsights?.keyFindings?.length > 0 ? (
                <ul className="space-y-2">
                  {aiInsights.structuredInsights.keyFindings.map((finding, index) => (
                    <li key={index} className="text-sm text-blue-700 flex items-start">
                      <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      {finding}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-blue-700 whitespace-pre-wrap">{aiInsights.rawInsight}</div>
              )}
            </div>

            {aiInsights.structuredInsights?.trends?.length > 0 && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-indigo-800 mb-2 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Trends & Patterns
                </h4>
                <ul className="space-y-2">
                  {aiInsights.structuredInsights.trends.map((trend, index) => (
                    <li key={index} className="text-sm text-indigo-700 flex items-start">
                      <ArrowRight className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      {trend}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Analysis Quality Indicator */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-900">Analysis Quality</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {aiInsights.analysisDepth || "Standard"} • {aiInsights.confidence || "High"} Confidence
                  </span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full w-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Business Tab */}
        {activeTab === "business" && (
          <div className="space-y-4">
            {aiInsights.structuredInsights?.businessInsights?.length > 0 ? (
              <div className="space-y-3">
                {aiInsights.structuredInsights.businessInsights.map((insight, index) => (
                  <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <Target className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-green-800 mb-1">Business Insight #{index + 1}</h4>
                        <p className="text-sm text-green-700">{insight}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="mx-auto h-12 w-12 text-gray-400" />
                <h4 className="mt-2 text-sm font-medium text-gray-900">No business insights available</h4>
                <p className="mt-1 text-sm text-gray-500">Try analyzing different data columns</p>
              </div>
            )}
          </div>
        )}

        {/* Data Quality Tab */}
        {activeTab === "quality" && (
          <div className="space-y-4">
            {aiInsights.structuredInsights?.dataQualityIssues?.length > 0 ? (
              <div className="space-y-3">
                {aiInsights.structuredInsights.dataQualityIssues.map((issue, index) => (
                  <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800 mb-1">Quality Issue #{index + 1}</h4>
                        <p className="text-sm text-yellow-700">{issue}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-green-800">Excellent Data Quality</h4>
                    <p className="text-sm text-green-700">No significant data quality issues detected</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Next Steps Tab */}
        {activeTab === "next" && (
          <div className="space-y-4">
            {aiInsights.structuredInsights?.nextSteps?.length > 0 ? (
              <div className="space-y-3">
                {aiInsights.structuredInsights.nextSteps.map((step, index) => (
                  <div key={index} className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-indigo-800 mb-1">Recommended Action</h4>
                        <p className="text-sm text-indigo-700">{step}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Flag className="mx-auto h-12 w-12 text-gray-400" />
                <h4 className="mt-2 text-sm font-medium text-gray-900">No specific recommendations</h4>
                <p className="mt-1 text-sm text-gray-500">Continue exploring your data for more insights</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer with analysis info */}
      <div className="px-6 py-3 bg-blue-50 border-t border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-blue-700">
            <Zap className="h-4 w-4 mr-2" />
            Professional Analytics Engine - No external dependencies
          </div>
          <div className="text-sm text-blue-600 font-medium">
            {isEnhanced ? "Enhanced Analysis Complete" : "Analysis Complete"}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIInsightsPanel
