// Assessment logic
class SpatialPlanningAssessment {
    constructor() {
        this.currentSphere = 1;
        this.totalSpheres = 9;
        this.responses = {};
        this.hromadaInfo = {};
        this.userRole = null;
        this.roleQuestions = null;
        this.recommendations = [];
        
        // Clear any previously saved responses
        localStorage.removeItem('assessmentResponses');
        localStorage.removeItem('assessmentResults');
        
        this.recommendationsPromise = this.loadRecommendations();
        this.initializeEventListeners();
        this.restoreState();
    }
    
    initializeEventListeners() {
        document.getElementById('initial-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.startAssessment();
        });

        // Listener for the Random Result button
        document.getElementById('random-fill-btn').addEventListener('click', () => {
            if (confirm('Це заповнить анкету випадковими даними і покаже сторінку результатів. Продовжити?')) {
                this.performRandomFill();
            }
        });

        // Standard navigation listeners
        document.getElementById('prev-btn').addEventListener('click', () => {
            // This is the definitive fix: handle welcome-page navigation directly.
            if (this.currentSphere === 1) {
                document.getElementById('assessment-section').classList.remove('active');
                document.getElementById('welcome-section').classList.add('active');
            } else {
                this.navigateSphere(-1);
            }
        });
        document.getElementById('next-btn').addEventListener('click', () => {
                this.navigateSphere(1);
        });
        document.getElementById('submit-btn').addEventListener('click', () => this.completeAssessment());
    }
    
    async startAssessment() {
        await this.recommendationsPromise;
        
        // Get and validate role
        this.userRole = document.getElementById('user-role').value;
        if (!this.userRole) {
            alert('Будь ласка, оберіть вашу роль');
            return;
        }
        
        // Get role-specific questions
        this.roleQuestions = window.getQuestionsForRole(this.userRole);
        
        // Calculate total spheres for this role
        this.totalSpheres = Object.keys(this.roleQuestions).length;
        
        // Save hromada information
        this.hromadaInfo = {
            hromada: document.getElementById('hromada-name').value,
            oblast: document.getElementById('oblast').value,
            email: document.getElementById('email').value,
            role: this.userRole,
            roleName: window.roles[this.userRole].name,
            timestamp: new Date().toISOString()
        };
        
        // Save to localStorage
        localStorage.setItem('hromadaInfo', JSON.stringify(this.hromadaInfo));
        
        // Switch to assessment section
        document.getElementById('welcome-section').classList.remove('active');
        document.getElementById('assessment-section').classList.add('active');
        
        // Load first sphere
        this.loadSphere(1);
        this.updateNavigationButtons();
        
        // Scroll to top on sphere load
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Save state
        this.saveState();
    }
    
    loadSphere(sphereNumber) {
        const container = document.getElementById('questions-container');
        container.innerHTML = '';
        
        // Get sphere keys for this role
        const sphereKeys = Object.keys(this.roleQuestions);
        const sphereKey = sphereKeys[sphereNumber - 1];
        
        if (!sphereKey) return;
        
        const sphereData = this.roleQuestions[sphereKey];
        
        // Set default 'na' for Likert questions if not already set
        sphereData.questions.forEach(question => {
            if (question.type === 'likert' && this.responses[question.id] === undefined) {
                this.saveResponse(question.id, 'na');
            }
        });
        
        // Create sphere section
        const sphereSection = document.createElement('div');
        sphereSection.className = 'sphere-section';
        sphereSection.innerHTML = `
            <h2 class="sphere-title">
                <span>${sphereData.icon}</span>
                ${sphereData.name}
            </h2>
        `;
        
        // Add questions
        sphereData.questions.forEach(question => {
            const questionElement = this.createQuestionElement(question);
            sphereSection.appendChild(questionElement);
        });
        
        container.appendChild(sphereSection);
        
        // Update progress
        this.updateProgress();
        
        // Restore previous answers if any
        this.restoreAnswers(sphereData.questions);
        
        // Scroll to top on sphere load
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    createQuestionElement(question) {
        const questionBlock = document.createElement('div');
        questionBlock.className = 'question-block';
        questionBlock.dataset.questionId = question.id;
        
        // Mark reverse-scored questions
        if (question.reverse) {
            questionBlock.dataset.reverse = 'true';
        }
        
        const questionText = document.createElement('p');
        questionText.className = 'question-text';
        questionText.textContent = question.text;
        
        // Add tooltip for q3
        if (question.id === 'q3') {
            // Create the ? icon
            const tooltipIcon = document.createElement('span');
            tooltipIcon.className = 'question-tooltip-icon';
            tooltipIcon.textContent = '?';
            tooltipIcon.tabIndex = 0;
            tooltipIcon.setAttribute('aria-label', 'Довідка');
            tooltipIcon.style.marginLeft = '8px';
            tooltipIcon.style.cursor = 'pointer';
            // Create the tooltip box
            const tooltip = document.createElement('span');
            tooltip.className = 'question-tooltip';
            tooltip.innerHTML = `
                Основні законодавчі  та підзаконні нормативно-правові акти:<br>
                — ЗУ «Про регулювання містобудівної діяльності»<br>
                — Земельний кодекс України<br>
                — ЗУ «Про основи містобудування»<br>
                — ЗУ «Про архітектурну діяльність»<br>
                — Державні будівельні норми (ДБН)
            `;
            tooltip.style.display = 'none';
            tooltipIcon.appendChild(tooltip);
            // Show/hide logic with mouseover/mouseout for both icon and tooltip
            let tooltipTimeout;
            const showTooltip = () => {
                clearTimeout(tooltipTimeout);
                tooltip.style.display = 'block';
            };
            const hideTooltip = () => {
                tooltipTimeout = setTimeout(() => {
                    tooltip.style.display = 'none';
                }, 120);
            };
            tooltipIcon.addEventListener('mouseenter', showTooltip);
            tooltipIcon.addEventListener('mouseleave', hideTooltip);
            tooltip.addEventListener('mouseenter', showTooltip);
            tooltip.addEventListener('mouseleave', hideTooltip);
            // Insert icon after question text
            questionText.appendChild(tooltipIcon);
        }
        
        questionBlock.appendChild(questionText);
        
        if (question.reverse) {
            const reverseNote = document.createElement('p');
            reverseNote.className = 'reverse-note';
            reverseNote.textContent = 'Увага: у цьому питанні вища оцінка означає гіршу ситуацію';
            questionBlock.appendChild(reverseNote);
        }
        
        if (question.type === 'likert') {
            questionBlock.appendChild(this.createLikertScale(question));
        } else if (question.type === 'multiple') {
            questionBlock.appendChild(this.createMultipleChoice(question));
        }
        
        return questionBlock;
    }
    
    createLikertScale(question) {
        const scaleContainer = document.createElement('div');
        scaleContainer.className = 'likert-container';

        // Likert scale row: Н/З, 1, 2, 3, 4, 5
        const scale = document.createElement('div');
        scale.className = 'likert-scale';

        // Н/З option
        const naOption = document.createElement('div');
        naOption.className = 'likert-option na-option';
        const naInput = document.createElement('input');
        naInput.type = 'radio';
        naInput.name = question.id;
        naInput.value = 'na';
        naInput.id = `${question.id}_na`;
        naInput.checked = true; // Set as default
        const naLabel = document.createElement('label');
        naLabel.htmlFor = `${question.id}_na`;
        naLabel.textContent = 'Н/З';
        naOption.appendChild(naInput);
        naOption.appendChild(naLabel);
        scale.appendChild(naOption);
        naInput.addEventListener('change', () => {
            this.saveResponse(question.id, 'na');
        });

        // 1-5 options
        for (let i = 1; i <= 5; i++) {
            const option = document.createElement('div');
            option.className = 'likert-option';
            const input = document.createElement('input');
            input.type = 'radio';
            input.name = question.id;
            input.value = i;
            input.id = `${question.id}_${i}`;
            const label = document.createElement('label');
            label.htmlFor = `${question.id}_${i}`;
            label.textContent = i;
            option.appendChild(input);
            option.appendChild(label);
            scale.appendChild(option);
            input.addEventListener('change', () => {
                this.saveResponse(question.id, i);
            });
        }
        scaleContainer.appendChild(scale);

        // Help text row: empty under Н/З, left under 1, right under 5
        const labels = document.createElement('div');
        labels.className = 'scale-labels';
        labels.innerHTML = `
            <span></span>
            <span>${question.scale[1]}</span>
            <span></span>
            <span></span>
            <span></span>
            <span>${question.scale[5]}</span>
        `;
        scaleContainer.appendChild(labels);
        return scaleContainer;
    }
    
    createMultipleChoice(question) {
        const container = document.createElement('div');
        container.className = 'multiple-choice';
        // Get saved value for restore
        const saved = this.responses[question.id];
        
        // Render all options first
        question.options.forEach(option => {
            const optionDiv = document.createElement('div');
            const input = document.createElement('input');
            input.type = question.multiple ? 'checkbox' : 'radio';
            input.name = question.id;
            input.value = option.value;
            input.id = `${question.id}_${option.value}`;
            const label = document.createElement('label');
            label.htmlFor = `${question.id}_${option.value}`;
            label.textContent = option.text;
            optionDiv.appendChild(input);
            optionDiv.appendChild(label);
            
            // If this is the 'other' option, add a text input
            let otherInput = null;
            if (option.value === 'other') {
                otherInput = document.createElement('input');
                otherInput.type = 'text';
                otherInput.placeholder = 'Вкажіть інші причини';
                otherInput.style.marginLeft = '8px';
                otherInput.style.flex = '1';
                otherInput.disabled = !(
                    (question.multiple && Array.isArray(saved) && saved.includes('other')) ||
                    (!question.multiple && saved === 'other')
                );
                // Restore value if present
                if (question.multiple && Array.isArray(saved) && typeof saved === 'object' && saved.otherText) {
                    otherInput.value = saved.otherText;
                } else if (!question.multiple && typeof saved === 'object' && saved.otherText) {
                    otherInput.value = saved.otherText;
                }
                optionDiv.appendChild(otherInput);
            }
            container.appendChild(optionDiv);
            
            // Add event listener
            input.addEventListener('change', () => {
                if (option.value === 'other' && otherInput) {
                    otherInput.disabled = !input.checked;
                    if (!input.checked) {
                        otherInput.value = '';
                    }
                }
                if (question.multiple) {
                    this.saveMultipleResponseWithOther(question.id, container);
                } else {
                    if (option.value === 'other' && input.checked && otherInput) {
                        this.saveResponse(question.id, { value: 'other', otherText: otherInput.value });
                    } else {
                        this.saveResponse(question.id, option.value);
                    }
                }
            });
            
            // Save text input on input
            if (otherInput) {
                otherInput.addEventListener('input', () => {
                    if (question.multiple) {
                        this.saveMultipleResponseWithOther(question.id, container);
                    } else if (input.checked) {
                        this.saveResponse(question.id, { value: 'other', otherText: otherInput.value });
                    }
                });
            }
        });
        
        // Add 'Невідомо' option last if not multiple selection and not already present
        if (!question.multiple && !question.options.some(opt => opt.value === 'unknown' || opt.text === 'Невідомо')) {
            const unknownDiv = document.createElement('div');
            const unknownInput = document.createElement('input');
            unknownInput.type = 'radio';
            unknownInput.name = question.id;
            unknownInput.value = 'unknown';
            unknownInput.id = `${question.id}_unknown`;
            const unknownLabel = document.createElement('label');
            unknownLabel.htmlFor = `${question.id}_unknown`;
            unknownLabel.textContent = 'Невідомо';
            unknownDiv.appendChild(unknownInput);
            unknownDiv.appendChild(unknownLabel);
            container.appendChild(unknownDiv);
            unknownInput.addEventListener('change', () => {
                this.saveResponse(question.id, 'unknown');
            });
        }
        
        return container;
    }
    
    // Helper for multiple with 'other'
    saveMultipleResponseWithOther(questionId, container) {
        const checkboxes = container.querySelectorAll(`input[name="${questionId}"]:checked`);
        const values = Array.from(checkboxes).map(cb => cb.value);
        let otherText = '';
        if (values.includes('other')) {
            const otherInput = container.querySelector('input[type="text"]');
            if (otherInput) {
                otherText = otherInput.value;
            }
        }
        // Save as object if 'other' is selected
        if (values.includes('other')) {
            this.responses[questionId] = { values, otherText };
        } else {
            this.responses[questionId] = values;
        }
        localStorage.setItem('assessmentResponses', JSON.stringify(this.responses));
        console.log(`Saved multiple response for ${questionId}:`, this.responses[questionId]);
    }
    
    saveResponse(questionId, value) {
        // Ensure we're storing the exact value
        this.responses[questionId] = value;
        localStorage.setItem('assessmentResponses', JSON.stringify(this.responses));
        
        // Debug log
        console.log(`Saved response for ${questionId}:`, value);
    }
    
    restoreAnswers(questions) {
        const savedResponses = localStorage.getItem('assessmentResponses');
        if (savedResponses) {
            this.responses = JSON.parse(savedResponses);
            
            questions.forEach(question => {
                const savedValue = this.responses[question.id];
                if (savedValue !== undefined) {
                    if (question.type === 'likert') {
                        const input = document.getElementById(`${question.id}_${savedValue}`);
                        if (input) {
                            input.checked = true;
                            console.log(`Restored Likert response for ${question.id}:`, savedValue);
                        }
                    } else if (question.type === 'multiple') {
                        if (question.multiple && Array.isArray(savedValue)) {
                            // Handle multiple selection with checkboxes
                            savedValue.forEach(val => {
                                const input = document.getElementById(`${question.id}_${val}`);
                                if (input) input.checked = true;
                            });
                            // Handle 'other' text if present
                            if (typeof savedValue === 'object' && savedValue.otherText) {
                                const otherInput = document.querySelector(`#${question.id}_other`).nextElementSibling;
                                if (otherInput && otherInput.type === 'text') {
                                    otherInput.value = savedValue.otherText;
                                    otherInput.disabled = false;
                                }
                            }
                        } else if (question.multiple && typeof savedValue === 'object' && savedValue.values) {
                            // Handle multiple selection with 'other' option
                            savedValue.values.forEach(val => {
                                const input = document.getElementById(`${question.id}_${val}`);
                                if (input) input.checked = true;
                            });
                            if (savedValue.otherText) {
                                const otherInput = document.querySelector(`#${question.id}_other`).nextElementSibling;
                                if (otherInput && otherInput.type === 'text') {
                                    otherInput.value = savedValue.otherText;
                                    otherInput.disabled = false;
                                }
                            }
                        } else {
                            // Handle single selection
                            const input = document.getElementById(`${question.id}_${savedValue}`);
                            if (input) {
                                input.checked = true;
                                // Handle 'other' text if present
                                if (typeof savedValue === 'object' && savedValue.otherText) {
                                    const otherInput = document.querySelector(`#${question.id}_other`).nextElementSibling;
                                    if (otherInput && otherInput.type === 'text') {
                                        otherInput.value = savedValue.otherText;
                                        otherInput.disabled = false;
                                    }
                                }
                            }
                        }
                        console.log(`Restored multiple choice response for ${question.id}:`, savedValue);
                    }
                }
            });
        }
    }
    
    validateCurrentSphere() {
        // As per user request, validation is disabled to allow free navigation.
        return true;
    }
    
    navigateSphere(direction) {
        this.currentSphere += direction;
        
        // Handle navigation loop
        if (this.currentSphere > this.totalSpheres) {
            this.completeAssessment();
            return;
        }
        if (this.currentSphere < 1) {
            // This path should ideally not be taken, but is a safeguard.
            this.currentSphere = 1;
        }
        
        this.loadSphere(this.currentSphere);
        this.updateNavigationButtons();
    }
    
    updateProgress() {
        const progress = ((this.currentSphere - 1) / this.totalSpheres) * 100;
        document.getElementById('progress-fill').style.width = `${progress}%`;
        document.getElementById('progress-text').textContent = `${Math.round(progress)}%`;
    }
    
    updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const submitBtn = document.getElementById('submit-btn');

        // The "Back" button is always enabled.
        prevBtn.disabled = false;
        
        // On the first sphere, its text changes to "To Main Page".
        if (this.currentSphere === 1) {
            prevBtn.textContent = 'На головну';
        } else {
            prevBtn.textContent = 'Назад';
        }
        
        // The "Submit" button appears only on the last sphere.
        if (this.currentSphere === this.totalSpheres) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'inline-block';
        } else {
            nextBtn.style.display = 'inline-block';
            submitBtn.style.display = 'none';
        }
    }
    
    createSphereNavigation() {
        const nav = document.createElement('div');
        nav.className = 'sphere-nav';
        
        for (let i = 1; i <= this.totalSpheres; i++) {
            const dot = document.createElement('div');
            dot.className = 'sphere-dot';
            dot.dataset.sphere = i;
            
            // Check if sphere is completed
            const sphereKey = `sphere${i}`;
            const sphereData = window.questionData[sphereKey];
            const isCompleted = sphereData && sphereData.questions.every(q => 
                this.responses[q.id] !== undefined
            );
            
            if (isCompleted) {
                dot.classList.add('completed');
            }
            
            if (i === this.currentSphere) {
                dot.classList.add('active');
            }
            
            // Add click handler for completed spheres
            if (isCompleted || i < this.currentSphere) {
                dot.style.cursor = 'pointer';
                dot.addEventListener('click', () => {
                    if (this.validateCurrentSphere()) {
                        this.currentSphere = i;
                        this.loadSphere(i);
                        this.updateNavigationButtons();
                    }
                });
            }
            
            nav.appendChild(dot);
        }
        
        return nav;
    }
    
    completeAssessment() {
        // Show loading state
        const submitBtn = document.getElementById('submit-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Обробка результатів...';
        
        // Calculate scores for each sphere
        setTimeout(() => {
        const scores = this.calculateScores();
        
        // Save results
        const results = {
            hromadaInfo: this.hromadaInfo,
            role: this.role,
            responses: this.responses,
            scores: scores,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('assessmentResults', JSON.stringify(results));
        
            // Show completion message with animation
            const completionMessage = document.createElement('div');
            completionMessage.className = 'completion-message';
            completionMessage.innerHTML = `
                <div class="completion-icon">✓</div>
                <h3>Оцінку завершено!</h3>
                <p>Ваші відповіді збережено. Зараз ви будете перенаправлені на сторінку результатів.</p>
            `;
            document.getElementById('assessment-section').appendChild(completionMessage);
            
            setTimeout(() => {
        this.showResults(results);
            }, 3000);

        }, 500);
    }
    
    calculateScores() {
        const scores = {};
        
        // Ensure role-specific questions are loaded
        if (!this.roleQuestions) {
            console.error("Role-specific questions not loaded, cannot calculate scores.");
            return {};
        }

        Object.entries(this.roleQuestions).forEach(([sphereKey, sphereData]) => {
            let totalScore = 0;
            let questionCount = 0;
            
            // Filter for Likert scale questions that should be scored
            const scorableLikertQuestions = sphereData.questions.filter(q => 
                q.type === 'likert' && q.score !== false
            );

            scorableLikertQuestions.forEach(q => {
                const response = this.responses[q.id];
                const score = parseInt(response, 10);

                if (!isNaN(score)) {
                    // Apply reverse scoring if the 'reverse' flag is set
                    totalScore += q.reverse ? (6 - score) : score;
                    questionCount++;
                }
            });

            // Avoid division by zero and store the average score
            scores[sphereData.id] = questionCount > 0 ? (totalScore / questionCount) : null;
        });
        
        return scores;
    }
    
    showResults(results) {
        // Update the main assessment object's state with the results being displayed.
        this.responses = results.responses;
        this.hromadaInfo = results.hromadaInfo;

        document.getElementById('assessment-section').classList.remove('active');
        document.getElementById('results-section').classList.add('active');
        
        // Update header with role information
        const header = document.querySelector('header');
        if (header) {
            const hromadaName = this.hromadaInfo.hromada || 'Назва громади';
            const roleName = this.hromadaInfo.roleName || 'Роль користувача';
            const date = new Date().toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' });
            header.innerHTML = `
                <h1>${hromadaName}</h1>
                <p class="subtitle">Оцінка спроможності до просторового планування</p>
                <p class="subtitle">${roleName}, ${date}</p>
            `;
        }

        const container = document.getElementById('results-container');
        const scores = this.calculateScores();
        const capacityLevel = this.getCapacityLevel(scores);
        
        // --- RADAR CHART ---
        // Sphere icons (adjust as needed)
        const sphereIcons = {
            policy: '📜',
            strategic: '🎯',
            data: '💾',
            financial: '💰',
            stakeholder: '👥',
            cooperation: '🤝',
            technical: '🛠️',
            political: '🏛️',
            adaptation: '🔄'
        };
        
        // Get only spheres with valid scores for this role
        const validSpheres = Object.entries(scores)
            .filter(([id, score]) => score !== null && !isNaN(Number(score)))
            .map(([id, score]) => ({
                id,
                score: Number(score),
                name: (this.roleQuestions && Object.values(this.roleQuestions).find(s => s.id === id)?.name) || id,
                icon: sphereIcons[id] || ''
            }));
        
        if (validSpheres.length === 0) return; // nothing to show
        
        container.innerHTML = (capacityLevel.html || '') + this.createScoresTable(validSpheres, scores);
        this.addRecommendationButtons();
        
        // Prepare labels and data
        const labels = validSpheres.map(s => `${s.icon} ${s.name}`);
        const values = validSpheres.map(s => s.score);
        const benchmark = 2.5;
        
        // Color logic from reference
        function getColorForValue(value) {
            if (value < benchmark) {
                const ratio = (value - 1) / (benchmark - 1);
                const red = 255;
                const green = Math.round(100 + ratio * 155);
                const blue = Math.round(100 + ratio * 155);
                return `rgb(${red}, ${green}, ${blue})`;
            } else {
                const ratio = (value - benchmark) / (5 - benchmark);
                const red = Math.round(255 - ratio * 155);
                const green = 200;
                const blue = Math.round(255 - ratio * 155);
                return `rgb(${red}, ${green}, ${blue})`;
            }
        }
        
        const pointColors = values.map(v => getColorForValue(v));
        
        // Draw chart
        setTimeout(() => {
            const ctx = document.getElementById('radarChart').getContext('2d');
            if (window.radarChartInstance) {
                window.radarChartInstance.destroy();
            }
            window.radarChartInstance = new Chart(ctx, {
                type: 'radar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Поточна оцінка',
                        data: values,
                        borderColor: 'rgb(75, 192, 192)',
                        backgroundColor: 'rgba(100, 150, 200, 0.1)',
                        pointBackgroundColor: pointColors,
                        pointBorderColor: pointColors,
                        pointHoverBackgroundColor: pointColors,
                        pointHoverBorderColor: pointColors,
                        pointRadius: 6,
                        pointHoverRadius: 8,
                        borderWidth: 2,
                        segment: {
                            borderColor: function(ctx) {
                                const p0DataIndex = ctx.p0DataIndex;
                                const p1DataIndex = ctx.p1DataIndex;
                                const p0Value = values[p0DataIndex];
                                const p1Value = values[p1DataIndex];
                                const avgValue = (p0Value + p1Value) / 2;
                                return getColorForValue(avgValue);
                            }
                        }
                    }, {
                        label: 'Бенчмарк (2.5)',
                        data: Array(labels.length).fill(benchmark),
                        borderColor: 'rgba(128, 128, 128, 0.5)',
                        backgroundColor: 'rgba(128, 128, 128, 0.05)',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        pointRadius: 0,
                        pointHoverRadius: 0
                    }]
                },
                options: {
                    devicePixelRatio: 2.5,
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                font: {
                                    size: 14,
                                    family: 'Georgia'
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return context.dataset.label + ': ' + context.parsed.r.toFixed(2);
                                }
                            },
                            titleFont: {
                                family: 'Georgia'
                            },
                            bodyFont: {
                                family: 'Georgia'
                            }
                        }
                    },
                    scales: {
                        r: {
                            beginAtZero: true,
                            min: 0,
                            max: 5,
                            ticks: {
                                stepSize: 1,
                                font: {
                                    size: 12,
                                    family: 'Georgia'
                                }
                            },
                            pointLabels: {
                                font: {
                                    size: 12,
                                    family: 'Georgia'
                                },
                                callback: function(value, index) {
                                    const maxLength = 25;
                                    if (value.length > maxLength) {
                                        const iconEnd = value.indexOf(' ') + 1;
                                        const icon = value.substring(0, iconEnd);
                                        const text = value.substring(iconEnd);
                                        const words = text.split(' ');
                                        const lines = [icon];
                                        let currentLine = '';
                                        for (const word of words) {
                                            if ((currentLine + word).length < maxLength) {
                                                currentLine += (currentLine ? ' ' : '') + word;
                                            } else {
                                                if (currentLine) lines.push(currentLine);
                                                currentLine = word;
                                            }
                                        }
                                        if (currentLine) lines.push(currentLine);
                                        return lines;
                                    }
                                    return value;
                                }
                            }
                        }
                    }
                }
            });
        }, 0);
        // --- END RADAR CHART ---
        this.setupModalHandlers();
    }
    
    _getScoreColor(value) {
        const benchmark = 2.5;
        if (value < benchmark) {
            const ratio = (value - 1) / (benchmark - 1);
            const red = 255;
            const green = Math.round(50 + ratio * 100);
            const blue = Math.round(50 + ratio * 100);
            return `rgb(${red}, ${green}, ${blue})`;
        } else {
            const ratio = (value - benchmark) / (5 - benchmark);
            const red = Math.round(255 - ratio * 200);
            const green = 200;
            const blue = Math.round(255 - ratio * 200);
            return `rgb(${red}, ${green}, ${blue})`;
        }
    }

    createScoresTable(validSpheres, scores) {
        let tableHtml = `<div class="scores-list-container">
            <h3 class="results-header">Оцінки за сферами</h3>
            <div class="scores-list">`;

        for (const sphere of validSpheres) {
            const scoreValue = sphere.score !== null ? sphere.score.toFixed(1) : 'N/A';
            const scoreColor = this._getScoreColor(sphere.score);
            const hasRecs = this._sphereHasRecommendations(sphere.id, scores);

            const recommendButtonHtml = hasRecs ? `
                <button class="btn btn-primary sphere-recommend-btn" data-sphere-id="${sphere.id}" data-sphere-name="${sphere.name}">
                    Рекомендації
                </button>
            ` : '';
            
            tableHtml += `
                <div class="score-list-row">
                    <div class="score-list-name">
                        <span class="score-list-icon">${sphere.icon}</span> 
                        <span>${sphere.name}</span>
                    </div>
                    <div class="score-list-value">
                        <strong style="color: ${scoreColor};">${scoreValue}</strong> / 5
                    </div>
                    <div class="score-list-actions">
                        ${recommendButtonHtml}
                    </div>
                </div>
            `;
        }

        tableHtml += `</div></div>`;
        return tableHtml;
    }
   
    createScoresHtmlForPdf(scores, compact = false) {
        let html = `<h3 style="text-align: center; font-family: 'Inter', sans-serif; font-size: ${compact ? '15px' : '18px'}; margin-bottom: ${compact ? '8px' : '15px'}; color: #333;">Оцінки за сферами</h3>`;
        html += `<table style="width: 100%; border-collapse: collapse; font-family: 'Inter', sans-serif; font-size: ${compact ? '11px' : '14px'};">`;

        // Iterate over the user's role-specific questions to get the correct spheres and their order
        for (const sphereKey in this.roleQuestions) {
            const sphere = this.roleQuestions[sphereKey];
            const score = scores[sphere.id];

            // Only include spheres that have a valid score for this role
            if (score !== null && score !== undefined) {
            const color = this._getScoreColor(score);
                const bgColor = color.replace('rgb', 'rgba').replace(')', ', 0.15)');

            html += `
                <tr style="background-color: ${bgColor}; border-bottom: 1px solid #eee;">
                        <td style="padding: ${compact ? '4px 4px' : '10px 8px'};">${sphere.icon} ${sphere.name}</td>
                        <td style="padding: ${compact ? '4px 4px' : '10px 8px'}; text-align: right; font-weight: bold;">${score.toFixed(1)} / 5</td>
                </tr>
            `;
            }
        }

        html += '</table>';
        return html;
    }
   
    calculateOverallScore(scores) {
        const values = Object.values(scores).filter(v => v !== null);
        if (values.length === 0) return 0;
        
        const sum = values.reduce((a, b) => parseFloat(a) + parseFloat(b), 0);
        return (sum / values.length).toFixed(1);
    }
    
    getCapacityLevel(scores) {
        const overallScore = this.calculateOverallScore(scores);
        
        // Level 1: Initial Capacity
        if (overallScore < 2.5 || scores.policy < 2.5 || scores.political < 2.5) {
            return {
                level: 1,
                name: 'Початковий',
                description: 'Базові правові зобов\'язання не виконуються або виконуються лише формально'
            };
        }
        
        // Level 2: Basic Capacity
        if (overallScore >= 2.5 && 
            scores.policy >= 2.5 && 
            scores.political >= 2.5 &&
            (scores.technical >= 2.5 || scores.financial >= 2.5)) {
            return {
                level: 2,
                name: 'Базовий',
                description: 'Правові норми загалом дотримуються, керівництво підтримує планування'
            };
        }
        
        // Level 3: Functional Capacity
        if (scores.strategic >= 2.5 && scores.data >= 2.5) {
            return {
                level: 3,
                name: 'Функціональний',
                description: 'Стратегічні документи розробляються, дані використовуються для планування'
            };
        }
        
        // Level 4: Operational Capacity
        if (scores.stakeholder >= 2.5 && scores.cooperation >= 2.5) {
            return {
                level: 4,
                name: 'Операційний',
                description: 'Систематична участь громадськості, ефективна міжвідомча координація'
            };
        }
        
        // Level 5: Strategic Capacity
        if (scores.adaptation >= 2.5 && 
            Object.values(scores).every(score => score >= 2.5) &&
            Object.values(scores).filter(score => score >= 3.5).length >= 5) {
            return {
                level: 5,
                name: 'Стратегічний',
                description: 'Зріла організація, що може передбачати ризики та керувати змінами'
            };
        }
        
        // Level 6: Leadership Capacity
        if (Object.values(scores).every(score => score >= 3.5) &&
            Object.values(scores).filter(score => score >= 4.5).length >= 3) {
            return {
                level: 6,
                name: 'Лідерський',
                description: 'Національний приклад найкращих практик, здатність підтримувати інші громади'
            };
        }
        
        // Default to Level 2 if criteria not met
        return {
            level: 2,
            name: 'Базовий',
            description: 'Правові норми загалом дотримуються, керівництво підтримує планування'
        };
    }
    
    addRecommendationButtons() {
        // This should now correctly find buttons within the new table structure.
        const recommendBtns = document.querySelectorAll('.sphere-recommend-btn');
        recommendBtns.forEach(btn => {
            const sphereId = btn.dataset.sphereId;
            const sphereName = btn.dataset.sphereName;
            btn.addEventListener('click', () => {
                this.showRecommendationModal(sphereId, sphereName);
            });
        });

        const downloadBtn = document.getElementById('download-pdf-btn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadPdfResults());
        }
    }
    
    showRecommendationModal(sphereId, sphereName) {
        const modal = document.getElementById('recommendation-modal');
        const titleEl = document.getElementById('modal-sphere-title');
        const contentEl = document.getElementById('modal-recommendation-text');
        
        // Find sphere data from role-specific questions
        const sphereData = Object.values(this.roleQuestions).find(s => s.id === sphereId);
        
        if (!sphereData) {
            console.error('Sphere data not found for ID:', sphereId);
            return;
        }

        // Calculate Average Score for the current sphere
        const likertQuestions = sphereData.questions.filter(q => q.type === 'likert');
        let totalScore = 0;
        let scoreCount = 0;
        likertQuestions.forEach(q => {
            const response = this.responses[q.id];
            const score = parseInt(response, 10);
            if (!isNaN(score)) {
                let effectiveScore = score;
                if (q.reverse) {
                    effectiveScore = 6 - score;
                }
                totalScore += effectiveScore;
                scoreCount++;
            }
        });
        const avgScore = (scoreCount > 0) ? (totalScore / scoreCount) : 0;

        titleEl.innerHTML = `<span>${sphereData.icon}</span> ${sphereName}`;
        contentEl.innerHTML = '';

        const listItems = [];
        const sphereQuestionIds = sphereData.questions.map(q => q.id);

        const applicableRecs = this.recommendations.filter(r => 
            (r.sphereId && r.sphereId === sphereId) || (r.questionId && sphereQuestionIds.includes(r.questionId))
        );

        applicableRecs.forEach(rec => {
            let conditionMet = false;
            if (rec.sphereId) {
                conditionMet = this.evaluateCondition(rec.condition, null, avgScore);
            } else {
                const response = this.responses[rec.questionId];
                if (response !== undefined) {
                    conditionMet = this.evaluateCondition(rec.condition, response, null);
                }
            }

            if (conditionMet) {
                let recHtml = '';
                if (rec.text) {
                    // Preserve layout for numbered lists
                    const textHtml = rec.text.split('\n').map(line => `<div>${line}</div>`).join('');
                    recHtml += `<div class="recommendation-text">${textHtml}</div>`;
                }
                
                if (rec.resources && rec.resources.length > 0) {
                    recHtml += '<div class="recommendation-resources">';
                    rec.resources.forEach(res => {
                        recHtml += `
                            <div class="resource-item">
                                <p class="resource-title">${res.title}</p>
                                <button onclick="window.open('${res.url}', '_blank', 'noopener,noreferrer')" class="recommendation-resource-btn">Читати</button>
                            </div>`;
                    });
                    recHtml += '</div>';
                }
                
                if (recHtml) {
                    listItems.push(`<li>${recHtml}</li>`);
                }
            }
        });

        if (listItems.length > 0) {
            let html = '<h4>Рекомендації та ресурси:</h4>';
            html += '<ol class="recommendation-list">';
            html += listItems.join('');
            html += '</ol>';
            contentEl.innerHTML = html;
        } else {
            contentEl.innerHTML = `
                <h4>Рекомендації та ресурси:</h4>
                <p>Для цієї сфери, на основі ваших відповідей, рекомендацій не знайдено.</p>
            `;
        }

        modal.style.display = 'flex';
        this.setupModalHandlers();
    }
    
    async downloadPdfResults() {
        const { jsPDF } = window.jspdf;
        const resultsSection = document.getElementById('results-section');
        const hromadaName = this.hromadaInfo.hromada || 'Hromada';
        const date = new Date().toLocaleDateString('uk-UA');
        
        const downloadBtn = document.getElementById('download-pdf-btn');
        const originalBtnText = downloadBtn.textContent;
        downloadBtn.textContent = 'Генеруємо звіт...';
        downloadBtn.disabled = true;

        try {
            const doc = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: 'a4',
                putOnlyUsedFonts: true,
                compress: true,
                margin: 8 // smaller margin
            });

            // --- Render helper ---
            const renderHtmlToCanvas = async (html, width = 520) => {
                const container = document.createElement('div');
                container.style.position = 'absolute';
                container.style.left = '-9999px';
                container.style.top = '0';
                container.style.width = `${width}px`;
                container.style.backgroundColor = 'white';
                container.style.padding = '4px'; // Even smaller padding
                container.style.fontFamily = 'Inter, Arial, sans-serif';
                container.innerHTML = html;
                document.body.appendChild(container);

                const canvas = await html2canvas(container, {
                    backgroundColor: '#ffffff',
                    scale: 2, // Higher resolution
                });
                
                document.body.removeChild(container);
                return canvas;
            };

            // 1. Render Header
            const headerHtml = `
                <div style="text-align: center;">
                    <h1 style="font-size: 18px; font-weight: bold; margin-bottom: 6px; color: #333;">Звіт з оцінки спроможності до просторового планування</h1>
                    <h2 style="font-size: 14px; font-weight: 600; margin-bottom: 2px; color: #555;">${hromadaName}</h2>
                    <p style="font-size: 11px; color: #666;">Роль: ${this.hromadaInfo.roleName || 'Не вказано'}</p>
                    <p style="font-size: 11px; color: #666;">Дата: ${date}</p>
                </div>
            `;
            const headerCanvas = await renderHtmlToCanvas(headerHtml);
            const headerImgData = headerCanvas.toDataURL('image/png');
            const headerImgWidth = 180;
            const headerImgHeight = (headerCanvas.height * headerImgWidth) / headerCanvas.width;
            doc.addImage(headerImgData, 'PNG', 10, 10, headerImgWidth, headerImgHeight);
            let currentY = 10 + headerImgHeight + 2;
            
            // 2. Render Chart (Larger, above scores)
            const chartContainer = resultsSection.querySelector('.chart-container');
            const chartCanvas = await html2canvas(chartContainer, { backgroundColor: '#ffffff', scale: 2 });
            const chartImgData = chartCanvas.toDataURL('image/png');
            const chartImgWidth = 180;
            const chartImgHeight = (chartCanvas.height * chartImgWidth) / chartCanvas.width;
            doc.addImage(chartImgData, 'PNG', 10, currentY, chartImgWidth, chartImgHeight);
            currentY += chartImgHeight + 5;
            
            // 3. Render Scores Table (compact, below chart)
            const scores = this.calculateScores();
            const scoresHtml = this.createScoresHtmlForPdf(scores, true); // pass compact flag
            const scoresCanvas = await renderHtmlToCanvas(scoresHtml, 520);
            const scoresImgData = scoresCanvas.toDataURL('image/png');
            const scoresImgWidth = 170;
            const scoresImgHeight = (scoresCanvas.height * scoresImgWidth) / scoresCanvas.width;
            doc.addImage(scoresImgData, 'PNG', 15, currentY, scoresImgWidth, scoresImgHeight);
            currentY += scoresImgHeight + 2;

            // 4. Render Recommendations
            const spheresWithRecs = [];
            Object.values(this.roleQuestions).forEach(sphere => {
                const sphereId = sphere.id;
                const likertQuestions = sphere.questions.filter(q => q.type === 'likert');
                let totalScore = 0;
                let scoreCount = 0;
                likertQuestions.forEach(q => {
                    const response = this.responses[q.id];
                    const score = parseInt(response, 10);
                    if (!isNaN(score)) {
                        totalScore += q.reverse ? (6 - score) : score;
                        scoreCount++;
                    }
                });
                const avgScore = scoreCount > 0 ? (totalScore / scoreCount) : 0;
                const applicableRecs = this.recommendations.filter(r => {
                    if (r.sphereId && r.sphereId === sphereId) return this.evaluateCondition(r.condition, null, avgScore);
                    if (r.questionId && sphere.questions.some(q => q.id === r.questionId)) return this.evaluateCondition(r.condition, this.responses[r.questionId], null);
                    return false;
                });
                if (applicableRecs.length > 0) spheresWithRecs.push({ sphere, recs: applicableRecs });
            });

            if (spheresWithRecs.length > 0) {
                doc.addPage();
                const recHeaderHtml = `<h2 style="font-size: 18px; font-weight: bold; text-align: center; color: #333;">Рекомендації за сферами</h2>`;
                const recHeaderCanvas = await renderHtmlToCanvas(recHeaderHtml);
                const recHeaderImgData = recHeaderCanvas.toDataURL('image/png');
                const recHeaderImgWidth = 170;
                const recHeaderImgHeight = (recHeaderCanvas.height * recHeaderImgWidth) / recHeaderCanvas.width;
                doc.addImage(recHeaderImgData, 'PNG', 20, 20, recHeaderImgWidth, recHeaderImgHeight);
                currentY = 20 + recHeaderImgHeight + 10;

                for (const { sphere, recs } of spheresWithRecs) {
                    const sphereHeaderHtml = `<h3 style="font-size: 14px; font-weight: bold; color: #444; margin: 0;">${sphere.icon} ${sphere.name}</h3>`;
                    const sphereHeaderCanvas = await renderHtmlToCanvas(sphereHeaderHtml);
                    const sphereHeaderImgData = sphereHeaderCanvas.toDataURL('image/png');
                    const sphereHeaderImgWidth = 170;
                    const sphereHeaderImgHeight = (sphereHeaderCanvas.height * sphereHeaderImgWidth) / sphereHeaderCanvas.width;
                    if (currentY + sphereHeaderImgHeight > 280) { doc.addPage(); currentY = 20; }
                    doc.addImage(sphereHeaderImgData, 'PNG', 20, currentY, sphereHeaderImgWidth, sphereHeaderImgHeight);
                    currentY += sphereHeaderImgHeight + 3;

                    for (const rec of recs) {
                        if (rec.text) {
                            const lines = rec.text.split('\n');
                            for (const line of lines) {
                                const textHtml = `<p style="margin: 0; padding: 0; font-size: 11px; line-height: 1.2;">${line}</p>`;
                                const textCanvas = await renderHtmlToCanvas(textHtml, 560);
                                const textImgData = textCanvas.toDataURL('image/png');
                                const textImgWidth = 170;
                                const textImgHeight = (textCanvas.height * textImgWidth) / textCanvas.width;
                                if (currentY + textImgHeight > 280) { doc.addPage(); currentY = 20; }
                                const indent = line.trim().startsWith('—') || /^\d+\./.test(line.trim()) ? 5 : 0;
                                doc.addImage(textImgData, 'PNG', 25 + indent, currentY, textImgWidth, textImgHeight);
                                currentY += textImgHeight;
                            }
                        }

                        if (rec.resources && rec.resources.length > 0) {
                             currentY += 2;
                            for (const res of rec.resources) {
                                const linkHtml = `<p style="font-size: 11px; margin: 0; line-height: 1.2; color: #2980b9;">${res.title}</p>`;
                                const linkCanvas = await renderHtmlToCanvas(linkHtml, 550);
                                const linkImgData = linkCanvas.toDataURL('image/png');
                                const linkImgWidth = 165;
                                const linkImgHeight = (linkCanvas.height * linkImgWidth) / linkCanvas.width;
                                if (currentY + linkImgHeight > 280) { doc.addPage(); currentY = 20; }
                                doc.addImage(linkImgData, 'PNG', 25, currentY, linkImgWidth, linkImgHeight);
                                doc.link(25, currentY, linkImgWidth, linkImgHeight, { url: res.url });
                                currentY += linkImgHeight;
                            }
                        }
                        currentY += 4;
                    }
                }
            }

            const now = new Date();
            const day = String(now.getDate()).padStart(2, '0');
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const year = now.getFullYear();
            const downloadDate = `${day}.${month}.${year}`;

            const filename = `Оцінка спроможності (${hromadaName}, ${downloadDate}).pdf`;
            doc.save(filename);

        } catch (error) {
            console.error("Помилка при генерації PDF:", error);
            alert("Виникла помилка при створенні звіту. Будь ласка, спробуйте ще раз.");
        } finally {
            downloadBtn.textContent = originalBtnText;
            downloadBtn.disabled = false;
        }
    }

    setupModalHandlers() {
        const modal = document.getElementById('recommendation-modal');
        const closeBtn = document.getElementById('close-modal-btn');
        closeBtn.onclick = () => { modal.style.display = 'none'; };
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
    }
    
    evaluateCondition(condition, response, avg_score) {
        // A "Not Applicable" answer should never trigger a recommendation.
        if (response === 'na') {
            return false;
        }
        
        try {
            let value;
            let score = null; // Default score to null

            if (typeof response === 'object' && response !== null && !Array.isArray(response) && response.values) {
                // This correctly identifies the specific object format: { values: [...] }
                value = response.values;
            } else if (!isNaN(parseInt(response, 10))) {
                // This handles Likert scale responses
                score = parseInt(response, 10);
                value = score; // Some conditions might check score as a value
            } else {
                // This handles simple arrays and all other direct values
                value = response;
            }

            // The 'eval' context will now have the correct 'value' and 'score'
            const result = eval(`(function(value, score, avg_score) { return ${condition}; })(value, score, avg_score)`);
            return result;
        } catch (error) {
            console.error(`Error evaluating condition: "${condition}" with response:`, response, error);
            return false;
        }
    }
    
    async loadRecommendations() {
        try {
            const res = await fetch('recommendations.json');
            this.recommendations = await res.json();
        } catch (e) {
            this.recommendations = [];
        }
   }
   
   async performRandomFill() {
       await this.recommendationsPromise;
       
       // Randomly select a role
       const roleOptions = ['leadership', 'technical', 'department', 'cso', 'resident'];
       const randomRole = roleOptions[Math.floor(Math.random() * roleOptions.length)];
       
       // Set role in the form
       document.getElementById('user-role').value = randomRole;
       
       // 1. Set dummy hromada info and hide the welcome screen
       this.hromadaInfo = {
           hromada: 'Тестова громада',
           oblast: 'Тестова область',
           role: randomRole,
           roleName: window.roles[randomRole].name,
           timestamp: new Date().toISOString()
       };
       localStorage.setItem('hromadaInfo', JSON.stringify(this.hromadaInfo));
       document.getElementById('welcome-section').classList.remove('active');

       // 2. Get role-specific questions
       this.userRole = randomRole;
       this.roleQuestions = window.getQuestionsForRole(randomRole);
       this.totalSpheres = Object.keys(this.roleQuestions).length;

       // 3. Fill all responses with random data
       this.responses = {};
       
       Object.values(this.roleQuestions).forEach(sphere => {
           sphere.questions.forEach(question => {
               // Handle conditional questions based on previously generated random answers
               if (question.conditional) {
                   const dependsOnResponse = this.responses[question.conditional.dependsOn];
                   if (!dependsOnResponse || !question.conditional.showIf.includes(dependsOnResponse)) {
                       return;
                   }
               }

               let randomValue;
               switch (question.type) {
                   case 'likert':
                       randomValue = Math.floor(Math.random() * 5) + 1;
                       this.responses[question.id] = randomValue;
                       break;
                   case 'multiple':
                       const options = question.options.filter(o => o.value !== 'unknown');
                       if (options.length === 0) break;

                       if (question.multiple) {
                           const numToSelect = Math.floor(Math.random() * options.length) + 1;
                           const shuffled = [...options].sort(() => 0.5 - Math.random());
                           const selectedValues = shuffled.slice(0, numToSelect).map(o => o.value);

                           if (selectedValues.includes('other')) {
                               this.responses[question.id] = { values: selectedValues, otherText: 'Тестова відповідь для "інше"' };
                           } else {
                               this.responses[question.id] = selectedValues;
                           }
                       } else {
                           const randomIndex = Math.floor(Math.random() * options.length);
                           this.responses[question.id] = options[randomIndex].value;
                       }
                       break;
               }
           });
       });
       localStorage.setItem('assessmentResponses', JSON.stringify(this.responses));

       const scores = this.calculateScores();
       const results = {
           hromadaInfo: this.hromadaInfo,
           responses: this.responses,
           scores: scores,
           timestamp: new Date().toISOString()
       };
       localStorage.setItem('assessmentResults', JSON.stringify(results));
       
       // Show results
       this.showResults(results); 
   }

    async restoreState() {
        // Check for finished assessment first
        const savedResults = localStorage.getItem('assessmentResults');
        if (savedResults) {
            await this.recommendationsPromise;
            
            const results = JSON.parse(savedResults);
            this.userRole = results.hromadaInfo.role;
            this.roleQuestions = window.getQuestionsForRole(this.userRole);
            this.totalSpheres = Object.keys(this.roleQuestions).length;
            
            document.getElementById('welcome-section').classList.remove('active');
            document.getElementById('assessment-section').classList.remove('active');
            document.getElementById('results-section').classList.add('active');
            
            this.showResults(results);
            return;
        }
    
        // If no finished assessment, check for one in progress
        const savedState = localStorage.getItem('assessmentResponses');
        if (savedState) {
            this.responses = JSON.parse(savedState);
            this.hromadaInfo = JSON.parse(localStorage.getItem('hromadaInfo') || '{}');
            
            if (this.hromadaInfo.role) {
                this.userRole = this.hromadaInfo.role;
                this.roleQuestions = window.getQuestionsForRole(this.userRole);
                this.totalSpheres = Object.keys(this.roleQuestions).length;
            
            const lastAnsweredQ = Object.keys(this.responses).pop();
            let sphereToRestore = 1;
            if (lastAnsweredQ) {
                    const sphereKeys = Object.keys(this.roleQuestions);
                    for (let i = 0; i < sphereKeys.length; i++) {
                        const sphere = this.roleQuestions[sphereKeys[i]];
                        if (sphere.questions.some(q => q.id === lastAnsweredQ)) {
                            sphereToRestore = i + 1;
                        break;
                    }
                }
            }
            this.currentSphere = sphereToRestore;
    
            document.getElementById('welcome-section').classList.remove('active');
            document.getElementById('assessment-section').classList.add('active');
            this.loadSphere(this.currentSphere);
            }
        }
    }

    saveState() {
        if (this.currentSphere > this.totalSpheres) return;
        const state = {
            currentSphere: this.currentSphere
        };
        localStorage.setItem('assessmentState', JSON.stringify(state));
    }

    _sphereHasRecommendations(sphereId, scores) {
        if (!this.roleQuestions) return false;
        
        const sphereData = Object.values(this.roleQuestions).find(s => s.id === sphereId);
        if (!sphereData) return false;
    
        const sphereQuestions = sphereData.questions || [];
    
        // 1. Check for sphere-level recommendations based on average score
        const sphereRecs = this.recommendations
            .filter(r => r.sphereId === sphereId && r.condition)
            .filter(r => {
                const avg_score = scores[sphereId];
                return this.evaluateCondition(r.condition, null, avg_score);
            });
    
        if (sphereRecs.length > 0) return true;
    
        // 2. Check for question-level recommendations
        const questionRecs = this.recommendations
            .filter(r => sphereQuestions.some(q => q.id === r.questionId) && r.condition)
            .filter(r => {
                const response = this.responses[r.questionId];
                if (response === undefined) return false;
                const avg_score = scores[sphereId];
                return this.evaluateCondition(r.condition, response, avg_score);
            });
    
        return questionRecs.length > 0;
    }
}

// Initialize assessment when page loads
const assessment = new SpatialPlanningAssessment();