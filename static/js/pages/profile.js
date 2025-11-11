new Vue({
    el: "#app",
    delimiters: ["<%", "%>"],
    data() {
        return {
            data: {
                stats: {
                    out: [{}],
                    load: true
                },
                grades: {},
                scores: {
                    recent: {
                        out: [],
                        load: true,
                        more: {
                            limit: 6,
                            full: true
                        }
                    },
                    best: {
                        out: [],
                        load: true,
                        more: {
                            limit: 6,
                            full: true
                        }
                    },
                    first: {
                        out: [],
                        load: true,
                        more: {
                            limit: 6,
                            full: true
                        }
                    }
                },
                maps: {
                    most: {
                        out: [],
                        load: true,
                        more: {
                            limit: 6,
                            full: true
                        }
                    }
                },
                status: {}
            },
            mode: mode,
            mods: mods,
            modegulag: 0,
            userid: userid,
            playcountChart: null
        };
    },
    created() {
        // starting a page
        this.modegulag = this.StrtoGulagInt();
        this.LoadProfileData();
        this.LoadAllofdata();
        this.LoadUserStatus();
    },
    mounted() {
        // Initialize the playcount chart after the DOM is ready
        this.$nextTick(() => {
            this.initPlaycountChart();
        });
    },
    methods: {
        LoadAllofdata() {
            this.LoadMostBeatmaps();
            this.LoadScores('best');
            this.LoadScores('recent');
            this.LoadScores('first');
        },
        LoadProfileData() {
            this.$set(this.data.stats, 'load', true);
            this.$axios.get(`${window.location.protocol}//api.${domain}/v1/get_player_info`, {
                    params: {
                        id: this.userid,
                        scope: 'all'
                    }
                })
                .then(res => {
                    this.$set(this.data.stats, 'out', res.data.player.stats);
                    this.data.stats.load = false;
                });
        },
        LoadScores(sort) {
            this.$set(this.data.scores[`${sort}`], 'load', true);
            this.$axios.get(`${window.location.protocol}//api.${domain}/v1/get_player_scores`, {
                    params: {
                        id: this.userid,
                        mode: this.StrtoGulagInt(),
                        scope: sort,
                        limit: this.data.scores[`${sort}`].more.limit
                    }
                })
                .then(res => {
                    this.data.scores[`${sort}`].out = res.data.scores;
                    this.data.scores[`${sort}`].load = false
                    this.data.scores[`${sort}`].more.full = this.data.scores[`${sort}`].out.length != this.data.scores[`${sort}`].more.limit;
                });
        },
        LoadMostBeatmaps() {
            this.$set(this.data.maps.most, 'load', true);
            this.$axios.get(`${window.location.protocol}//api.${domain}/v1/get_player_most_played`, {
                    params: {
                        id: this.userid,
                        mode: this.StrtoGulagInt(),
                        limit: this.data.maps.most.more.limit
                    }
                })
                .then(res => {
                    this.data.maps.most.out = res.data.maps;
                    this.data.maps.most.load = false;
                    this.data.maps.most.more.full = this.data.maps.most.out.length != this.data.maps.most.more.limit;
                });
        },
        LoadUserStatus() {
            this.$axios.get(`${window.location.protocol}//api.${domain}/v1/get_player_status`, {
                    params: {
                        id: this.userid
                    }
                })
                .then(res => {
                    this.$set(this.data, 'status', res.data.player_status)
                })
                .catch(function (error) {
                    clearTimeout(loop);
                    console.log(error);
                });
            loop = setTimeout(this.LoadUserStatus, 5000);
        },
        ChangeModeMods(mode, mods) {
            if (window.event)
                window.event.preventDefault();

            this.mode = mode;
            this.mods = mods;

            this.modegulag = this.StrtoGulagInt();
            this.data.scores.recent.more.limit = 6
            this.data.scores.best.more.limit = 6
            this.data.maps.most.more.limit = 6
            this.LoadAllofdata();
            
            // Refresh the playcount chart for the new mode
            this.initPlaycountChart();
        },
        AddLimit(which) {
            if (window.event)
                window.event.preventDefault();

            if (which == 'bestscore') {
                this.data.scores.best.more.limit += 6;
                this.LoadScores('best');
            } else if (which == 'recentscore') {
                this.data.scores.recent.more.limit += 6;
                this.LoadScores('recent');
            } else if (which == 'firstscore') {
                this.data.scores.first.more.limit += 6;
                this.LoadScores('first');
            } else if (which == 'mostplay') {
                this.data.maps.most.more.limit += 4;
                this.LoadMostBeatmaps();
            }
        },
        actionIntToStr(d) {
            switch (d.action) {
                case 0:
                    return 'Idle: 🔍 Song Select';
                case 1:
                    return '🌙 AFK';
                case 2:
                    return `Playing: 🎶 ${d.info_text}`;
                case 3:
                    return `Editing: 🔨 ${d.info_text}`;
                case 4:
                    return `Modding: 🔨 ${d.info_text}`;
                case 5:
                    return 'In Multiplayer: Song Select';
                case 6:
                    return `Watching: 👓 ${d.info_text}`;
                    // 7 not used
                case 8:
                    return `Testing: 🎾 ${d.info_text}`;
                case 9:
                    return `Submitting: 🧼 ${d.info_text}`;
                    // 10 paused, never used
                case 11:
                    return 'Idle: 🏢 In multiplayer lobby';
                case 12:
                    return `In Multiplayer: Playing 🌍 ${d.info_text} 🎶`;
                case 13:
                    return 'Idle: 🔍 Searching for beatmaps in osu!direct';
                default:
                    return 'Unknown: 🚔 not yet implemented!';
            }
        },
        addCommas(nStr) {
            nStr += '';
            var x = nStr.split('.');
            var x1 = x[0];
            var x2 = x.length > 1 ? '.' + x[1] : '';
            var rgx = /(\d+)(\d{3})/;
            while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + ',' + '$2');
            }
            return x1 + x2;
        },
        secondsToDhm(seconds) {
            seconds = Number(seconds);
            var dDisplay = `${Math.floor(seconds / (3600 * 24))}d `;
            var hDisplay = `${Math.floor(seconds % (3600 * 24) / 3600)}h `;
            var mDisplay = `${Math.floor(seconds % 3600 / 60)}m `;
            return dDisplay + hDisplay + mDisplay;
        },
        StrtoGulagInt() {
            switch (this.mode + "|" + this.mods) {
                case 'std|vn':
                    return 0;
                case 'taiko|vn':
                    return 1;
                case 'catch|vn':
                    return 2;
                case 'mania|vn':
                    return 3;
                case 'std|rx':
                    return 4;
                case 'taiko|rx':
                    return 5;
                case 'catch|rx':
                    return 6;
                case 'std|ap':
                    return 8;
                default:
                    return -1;
            }
        },
        StrtoModeInt() {
            switch (this.mode) {
                case 'std':
                    return 0;
                case 'taiko':
                    return 1;
                case 'catch':
                    return 2;
                case 'mania':
                    return 3;
            }
        },
        async initPlaycountChart() {
            const ctx = document.getElementById('playcountChart');
            if (!ctx) return;

            try {
                // Fetch real playcount data from API
                const response = await this.$axios.get(
                    `${window.location.protocol}//api.${domain}/v1/get_player_playcount_history`,
                    {
                        params: {
                            id: this.userid,
                            mode: this.StrtoGulagInt(),
                            days: 30
                        }
                    }
                );

                if (response.data.status !== 'success') {
                    console.error('Failed to load playcount data:', response.data);
                    return;
                }

                // Parse the data from API
                const labels = [];
                const data = [];
                
                response.data.data.forEach(item => {
                    const date = new Date(item.date);
                    labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
                    data.push(item.playcount);
                });

                // Destroy existing chart if it exists
                if (this.playcountChart) {
                    this.playcountChart.destroy();
                }

                this.playcountChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Plays',
                        data: data,
                        borderColor: 'rgba(255, 179, 217, 0.8)',
                        backgroundColor: 'rgba(255, 179, 217, 0.2)',
                        tension: 0.4,
                        fill: true,
                        pointRadius: 3,
                        pointHoverRadius: 6,
                        pointBackgroundColor: 'rgba(255, 179, 217, 1)',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: 'rgba(255, 179, 217, 1)',
                            bodyColor: '#fff',
                            borderColor: 'rgba(255, 179, 217, 0.5)',
                            borderWidth: 1,
                            padding: 10,
                            displayColors: false,
                            callbacks: {
                                title: function(context) {
                                    return context[0].label;
                                },
                                label: function(context) {
                                    return `Plays: ${context.parsed.y}`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                color: 'rgba(255, 179, 217, 0.1)',
                                drawBorder: false
                            },
                            ticks: {
                                color: 'rgba(255, 179, 217, 0.7)',
                                maxRotation: 45,
                                minRotation: 45
                            }
                        },
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(255, 179, 217, 0.1)',
                                drawBorder: false
                            },
                            ticks: {
                                color: 'rgba(255, 179, 217, 0.7)',
                                precision: 0
                            }
                        }
                    }
                }
            });
            } catch (error) {
                console.error('Error loading playcount chart:', error);
                // Optionally show a message to the user
                if (ctx) {
                    const parentDiv = ctx.parentElement;
                    if (parentDiv) {
                        parentDiv.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">Unable to load playcount data</p>';
                    }
                }
            }
        },
        getModIcons(mods) {
            const modMap = {
                1: { name: 'NF', fullName: 'NoFail', class: 'mod-nf' },
                2: { name: 'EZ', fullName: 'Easy', class: 'mod-ez' },
                4: { name: 'TD', fullName: 'TouchDevice', class: 'mod-td' },
                8: { name: 'HD', fullName: 'Hidden', class: 'mod-hd' },
                16: { name: 'HR', fullName: 'HardRock', class: 'mod-hr' },
                32: { name: 'SD', fullName: 'SuddenDeath', class: 'mod-sd' },
                64: { name: 'DT', fullName: 'DoubleTime', class: 'mod-dt' },
                128: { name: 'RX', fullName: 'Relax', class: 'mod-rx' },
                256: { name: 'HT', fullName: 'HalfTime', class: 'mod-ht' },
                512: { name: 'NC', fullName: 'Nightcore', class: 'mod-nc' },
                1024: { name: 'FL', fullName: 'Flashlight', class: 'mod-fl' },
                2048: { name: 'AT', fullName: 'Autoplay', class: 'mod-at' },
                4096: { name: 'SO', fullName: 'SpunOut', class: 'mod-so' },
                8192: { name: 'AP', fullName: 'Autopilot', class: 'mod-ap' },
                16384: { name: 'PF', fullName: 'Perfect', class: 'mod-pf' },
                32768: { name: '4K', fullName: '4 Keys', class: 'mod-key' },
                65536: { name: '5K', fullName: '5 Keys', class: 'mod-key' },
                131072: { name: '6K', fullName: '6 Keys', class: 'mod-key' },
                262144: { name: '7K', fullName: '7 Keys', class: 'mod-key' },
                524288: { name: '8K', fullName: '8 Keys', class: 'mod-key' },
                1048576: { name: 'FI', fullName: 'FadeIn', class: 'mod-fi' },
                2097152: { name: 'RD', fullName: 'Random', class: 'mod-rd' },
                4194304: { name: 'CN', fullName: 'Cinema', class: 'mod-cn' },
                8388608: { name: 'TP', fullName: 'Target Practice', class: 'mod-tp' },
                16777216: { name: '9K', fullName: '9 Keys', class: 'mod-key' }
            };
            
            // Handle NC/DT conflict
            const hasNC = mods & 512;
            if (hasNC) {
                mods &= ~64; // Remove DT flag if NC is present
            }
            
            // Handle PF/SD conflict
            const hasPF = mods & 16384;
            if (hasPF) {
                mods &= ~32; // Remove SD flag if PF is present
            }
            
            let html = '<span class="mod-icons">';
            let foundMods = false;
            
            for (const [value, mod] of Object.entries(modMap)) {
                if (mods & parseInt(value)) {
                    html += `<span class="mod-badge ${mod.class}" data-tooltip="${mod.fullName}">${mod.name}</span>`;
                    foundMods = true;
                }
            }
            
            html += '</span>';
            
            return foundMods ? html : '<span class="mod-none">No mods</span>';
        },
    },
    computed: {}
});