import React, { useState, useEffect } from 'react';
import {
    calculatePracticeAllocation,
    getAvailableFocuses,
    getPopularCombinations,
    validatePracticeRequest,
    formatPracticeDuration,
    PRACTICE_TYPE
} from '../services/PracticeService.js';
import { useAuth } from '../contexts/AuthContext';

const PracticePlanCalculator = ({ selectedTeam = null, forceIndividual = false }) => {
    const { currentUser } = useAuth();

    // Determine practice type based on props
    const initialPracticeType = forceIndividual ? PRACTICE_TYPE.INDIVIDUAL :
        selectedTeam ? PRACTICE_TYPE.TEAM : PRACTICE_TYPE.INDIVIDUAL;

    const [formData, setFormData] = useState({
        practiceType: initialPracticeType,
        focusAreas: [],
        availableHours: 2,
        teamId: selectedTeam?.teamId || ''
    });

    const [availableFocuses, setAvailableFocuses] = useState([]);
    const [popularCombinations, setPopularCombinations] = useState(null);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingFocuses, setIsLoadingFocuses] = useState(true);

    useEffect(() => {
        fetchAvailableFocuses();
        fetchPopularCombinations();
    }, []);

    useEffect(() => {
        if (selectedTeam && !forceIndividual) {
            setFormData(prev => ({
                ...prev,
                teamId: selectedTeam.teamId,
                practiceType: PRACTICE_TYPE.TEAM
            }));
        }
    }, [selectedTeam, forceIndividual]);

    const fetchAvailableFocuses = async () => {
        try {
            const focuses = await getAvailableFocuses();
            setAvailableFocuses(focuses);
        } catch (err) {
            console.error('Error fetching focuses:', err);
            setError('Failed to load focus areas');
        } finally {
            setIsLoadingFocuses(false);
        }
    };

    const fetchPopularCombinations = async () => {
        try {
            const combinations = await getPopularCombinations();
            setPopularCombinations(combinations);
        } catch (err) {
            console.error('Error fetching popular combinations:', err);
            // Don't set error since this is not critical
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) : value
        }));
    };

    const handleFocusAreaChange = (focusValue, isChecked) => {
        setFormData(prev => {
            const newFocusAreas = isChecked
                ? [...prev.focusAreas, focusValue]
                : prev.focusAreas.filter(focus => focus !== focusValue);

            return {
                ...prev,
                focusAreas: newFocusAreas.slice(0, 3) // Limit to 3 focus areas
            };
        });
    };

    const handleUsePopularCombination = () => {
        if (!popularCombinations) return;

        const currentPopular = formData.practiceType === PRACTICE_TYPE.INDIVIDUAL
            ? popularCombinations.individual
            : popularCombinations.team;

        if (currentPopular && currentPopular.focuses && currentPopular.focuses.length > 0) {
            setFormData(prev => ({
                ...prev,
                focusAreas: currentPopular.focuses.map(focus => focus.name || focus)
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            // Validation
            const validation = validatePracticeRequest(formData);
            if (!validation.isValid) {
                throw new Error(validation.errors.join(', '));
            }

            const requestData = {
                practiceType: formData.practiceType,
                focusAreas: formData.focusAreas,
                availableHours: formData.availableHours,
                teamId: formData.practiceType === PRACTICE_TYPE.TEAM ? formData.teamId : null
            };

            const calculatedPlan = await calculatePracticeAllocation(requestData);
            setResult(calculatedPlan);

        } catch (err) {
            console.error('Error calculating practice plan:', err);
            const errorMessage = err.response?.data?.message ||
                err.message ||
                'Failed to calculate practice plan. Please try again.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const getFocusDisplayName = (focusValue) => {
        const focus = availableFocuses.find(f => f.value === focusValue);
        return focus ? focus.displayName : focusValue;
    };

    const getCurrentPopularCombination = () => {
        if (!popularCombinations) return null;

        return formData.practiceType === PRACTICE_TYPE.INDIVIDUAL
            ? popularCombinations.individual
            : popularCombinations.team;
    };

    if (isLoadingFocuses) {
        return (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex justify-center items-center h-32">
                    <svg className="animate-spin h-8 w-8 text-pink-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            </div>
        );
    }

    const currentPopular = getCurrentPopularCombination();

    return (
        <div className="space-y-6">
            {/* Calculator Form */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-6">
                    {forceIndividual ? 'Individual Practice Plan Calculator' :
                        selectedTeam ? `Team Practice Plan - ${selectedTeam.teamName}` :
                            'Practice Plan Calculator'}
                </h3>

                {/* Popular Combination Display */}
                {currentPopular && currentPopular.count > 0 && (
                    <div className="mb-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                                <h4 className="text-blue-300 font-medium">
                                    Most Popular {formData.practiceType === PRACTICE_TYPE.INDIVIDUAL ? 'Individual' : 'Team'} Combination
                                </h4>
                            </div>
                            <span className="text-xs text-blue-400 bg-blue-900/30 px-2 py-1 rounded-full">
                                {currentPopular.count} uses
                            </span>
                        </div>

                        {currentPopular.focuses && currentPopular.focuses.length > 0 ? (
                            <div className="space-y-3">
                                <div className="flex flex-wrap gap-2">
                                    {currentPopular.focuses.map((focus, index) => (
                                        <span key={index} className="px-3 py-1 bg-blue-600/30 text-blue-200 text-sm rounded-full border border-blue-500/30">
                                            {getFocusDisplayName(focus.name || focus)}
                                        </span>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={handleUsePopularCombination}
                                    className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200"
                                >
                                    Use This Combination
                                </button>
                            </div>
                        ) : (
                            <p className="text-blue-300 text-sm">No popular combination data available yet.</p>
                        )}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Practice Type - Only show if not forced to individual and no team selected */}
                    {!forceIndividual && !selectedTeam && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3">
                                Practice Type
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                                    formData.practiceType === PRACTICE_TYPE.INDIVIDUAL
                                        ? 'border-pink-500 bg-pink-500/10'
                                        : 'border-gray-600 hover:border-gray-500'
                                }`}>
                                    <input
                                        type="radio"
                                        name="practiceType"
                                        value={PRACTICE_TYPE.INDIVIDUAL}
                                        checked={formData.practiceType === PRACTICE_TYPE.INDIVIDUAL}
                                        onChange={handleInputChange}
                                        className="sr-only"
                                    />
                                    <div className="flex items-center">
                                        <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                                            formData.practiceType === PRACTICE_TYPE.INDIVIDUAL
                                                ? 'border-pink-500 bg-pink-500'
                                                : 'border-gray-400'
                                        }`}></div>
                                        <div>
                                            <div className="font-medium text-white">Individual</div>
                                            <div className="text-sm text-gray-400">Solo practice session</div>
                                        </div>
                                    </div>
                                </label>

                                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                                    formData.practiceType === PRACTICE_TYPE.TEAM
                                        ? 'border-pink-500 bg-pink-500/10'
                                        : 'border-gray-600 hover:border-gray-500'
                                }`}>
                                    <input
                                        type="radio"
                                        name="practiceType"
                                        value={PRACTICE_TYPE.TEAM}
                                        checked={formData.practiceType === PRACTICE_TYPE.TEAM}
                                        onChange={handleInputChange}
                                        className="sr-only"
                                    />
                                    <div className="flex items-center">
                                        <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                                            formData.practiceType === PRACTICE_TYPE.TEAM
                                                ? 'border-pink-500 bg-pink-500'
                                                : 'border-gray-400'
                                        }`}></div>
                                        <div>
                                            <div className="font-medium text-white">Team</div>
                                            <div className="text-sm text-gray-400">Group practice session</div>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Available Hours */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Available Hours
                        </label>
                        <div className="relative">
                            <input
                                type="range"
                                name="availableHours"
                                min="1"
                                max="12"
                                value={formData.availableHours}
                                onChange={handleInputChange}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                            />
                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                                <span>1h</span>
                                <span>6h</span>
                                <span>12h</span>
                            </div>
                        </div>
                        <div className="mt-2 text-center">
                            <span className="text-2xl font-bold text-pink-400">{formData.availableHours}</span>
                            <span className="text-gray-300 ml-1">hours</span>
                        </div>
                    </div>

                    {/* Focus Areas */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                            Focus Areas (Select 1-3)
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {availableFocuses.map((focus) => (
                                <label
                                    key={focus.value}
                                    className={`flex items-start p-3 border rounded-lg cursor-pointer transition ${
                                        formData.focusAreas.includes(focus.value)
                                            ? 'border-pink-500 bg-pink-500/10'
                                            : 'border-gray-600 hover:border-gray-500'
                                    } ${formData.focusAreas.length >= 3 && !formData.focusAreas.includes(focus.value) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={formData.focusAreas.includes(focus.value)}
                                        onChange={(e) => handleFocusAreaChange(focus.value, e.target.checked)}
                                        disabled={formData.focusAreas.length >= 3 && !formData.focusAreas.includes(focus.value)}
                                        className="sr-only"
                                    />
                                    <div className={`w-4 h-4 border-2 rounded mr-3 mt-0.5 flex-shrink-0 ${
                                        formData.focusAreas.includes(focus.value)
                                            ? 'border-pink-500 bg-pink-500'
                                            : 'border-gray-400'
                                    }`}>
                                        {formData.focusAreas.includes(focus.value) && (
                                            <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-medium text-white text-sm">{focus.displayName}</div>
                                        <div className="text-xs text-gray-400">{focus.description}</div>
                                    </div>
                                </label>
                            ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                            Selected: {formData.focusAreas.length}/3
                        </p>
                    </div>

                    {/* Team Selection (only for team practice when no team is selected) */}
                    {formData.practiceType === PRACTICE_TYPE.TEAM && !selectedTeam && !forceIndividual && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Team ID (Optional)
                            </label>
                            <input
                                type="text"
                                name="teamId"
                                value={formData.teamId}
                                onChange={handleInputChange}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition duration-200"
                                placeholder="Enter team ID for team-specific recommendations"
                            />
                        </div>
                    )}

                    {/* Current Context Info */}
                    <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                        <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-full ${
                                formData.practiceType === PRACTICE_TYPE.TEAM ? 'bg-blue-600/20' : 'bg-pink-600/20'
                            }`}>
                                {formData.practiceType === PRACTICE_TYPE.TEAM ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                )}
                            </div>
                            <div>
                                <p className="text-sm text-gray-300">
                                    <span className="font-medium">Training for:</span> {currentUser?.username || 'Loading...'}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {formData.practiceType === PRACTICE_TYPE.TEAM ? 'Team practice session' : 'Individual practice session'}
                                    {selectedTeam && ` • ${selectedTeam.teamName}`}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div>
                        <button
                            type="submit"
                            disabled={isLoading || formData.focusAreas.length === 0}
                            className={`w-full px-6 py-3 bg-gradient-to-r from-pink-600 to-red-600 text-white font-medium rounded-lg shadow-lg hover:from-pink-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition duration-200 ${
                                isLoading || formData.focusAreas.length === 0 ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Calculating...
                                </span>
                            ) : 'Generate Practice Plan'}
                        </button>
                    </div>
                </form>

                {/* Error Message */}
                {error && (
                    <div className="mt-6 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-400 animate-fade-in">
                        <div className="flex">
                            <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <p className="font-medium">Error generating practice plan</p>
                                <p className="text-sm mt-1">{error}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Results */}
            {result && (
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-6">Your Practice Plan</h3>

                    <div className="space-y-6">
                        {/* Plan Overview */}
                        <div className="bg-gray-700/50 p-4 rounded-lg">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                <div>
                                    <div className="text-2xl font-bold text-pink-400">{result.totalHours}h</div>
                                    <div className="text-sm text-gray-400">Total Time</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-blue-400">{Object.keys(result.breakdown).length}</div>
                                    <div className="text-sm text-gray-400">Focus Areas</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-green-400">{result.practiceType}</div>
                                    <div className="text-sm text-gray-400">Type</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-yellow-400">
                                        {new Date(result.generatedAt).toLocaleDateString()}
                                    </div>
                                    <div className="text-sm text-gray-400">Generated</div>
                                </div>
                            </div>
                        </div>

                        {/* Focus Area Breakdown */}
                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-white">Time Allocation</h4>
                            {Object.entries(result.breakdown).map(([focusKey, allocation]) => (
                                <div key={focusKey} className="bg-gray-700/30 p-4 rounded-lg">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h5 className="font-semibold text-white">{getFocusDisplayName(focusKey)}</h5>
                                            <p className="text-sm text-gray-400">
                                                {formatPracticeDuration(allocation.hours)} • {allocation.percentage}% of total time
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-pink-400">
                                                {formatPracticeDuration(allocation.hours)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full bg-gray-600 rounded-full h-2 mb-3">
                                        <div
                                            className="bg-gradient-to-r from-pink-500 to-red-500 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${allocation.percentage}%` }}
                                        ></div>
                                    </div>

                                    {/* Suggested Activities */}
                                    <div>
                                        <p className="text-sm font-medium text-gray-300 mb-2">Suggested Activities:</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {allocation.suggestedActivities.map((activity, index) => (
                                                <div key={index} className="flex items-center text-sm text-gray-400">
                                                    <div className="w-1.5 h-1.5 bg-pink-500 rounded-full mr-2"></div>
                                                    {activity}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => setResult(null)}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-200"
                            >
                                Generate New Plan
                            </button>
                            <button
                                onClick={() => {
                                    const planText = `Practice Plan - ${result.totalHours}h ${result.practiceType}\n\n` +
                                        Object.entries(result.breakdown).map(([focus, allocation]) =>
                                            `${getFocusDisplayName(focus)}: ${formatPracticeDuration(allocation.hours)} (${allocation.percentage}%)\n` +
                                            allocation.suggestedActivities.map(activity => `  • ${activity}`).join('\n')
                                        ).join('\n\n');

                                    navigator.clipboard.writeText(planText);
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                            >
                                Copy to Clipboard
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PracticePlanCalculator;