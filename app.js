// Mock State Database
        let state = {
            books: [
                { id: 1, title: 'Clean Code', author: 'Robert C. Martin', genre: 'Técnico / Programação', year: 2008, available: false, colorBg: 'bg-indigo-500' },
                { id: 2, title: 'O Senhor dos Anéis', author: 'J.R.R. Tolkien', genre: 'Fantasia', year: 1954, available: true, colorBg: 'bg-amber-500' },
                { id: 3, title: 'Dom Casmurro', author: 'Machado de Assis', genre: 'Romance', year: 1899, available: true, colorBg: 'bg-emerald-500' },
                { id: 4, title: 'Sapiens: Uma Breve História', author: 'Yuval Noah Harari', genre: 'História', year: 2011, available: true, colorBg: 'bg-blue-500' },
                { id: 5, title: 'Arquitetura Limpa', author: 'Robert C. Martin', genre: 'Técnico / Programação', year: 2017, available: true, colorBg: 'bg-purple-500' }
            ],
            members: [
                { id: 1, name: 'Lucas Silveira', email: 'lucas@email.com' },
                { id: 2, name: 'Mariana Souza', email: 'mariana@email.com' },
                { id: 3, name: 'Carlos Eduardo', email: 'carlos@email.com' }
            ],
            loans: [
                { id: 1, memberId: 1, bookId: 1, loanDate: '2026-03-25', dueDate: '2026-04-08', status: 'Ativo' }
            ]
        };

        // Initialize application on load
        window.onload = function() {
            renderDashboard();
            renderBooks();
            renderLoans();
            renderMembers();
        };

        // Tab Navigation
        function switchTab(tabName) {
            ['dashboard', 'books', 'loans', 'members'].forEach(t => {
                document.getElementById(`tab-${t}`).classList.add('hidden');
                document.getElementById(`nav-${t}`).classList.remove('text-indigo-600', 'bg-indigo-50', 'dark:bg-indigo-950/50', 'dark:text-indigo-400');
                document.getElementById(`nav-${t}`).classList.add('text-slate-600', 'dark:text-slate-400');
            });

            document.getElementById(`tab-${tabName}`).classList.remove('hidden');
            const activeNav = document.getElementById(`nav-${tabName}`);
            activeNav.classList.remove('text-slate-600', 'dark:text-slate-400');
            activeNav.classList.add('text-indigo-600', 'bg-indigo-50', 'dark:bg-indigo-950/50', 'dark:text-indigo-400');

            const titles = { dashboard: 'Painel Estatístico', books: 'Acervo de Livros', loans: 'Controle de Empréstimos', members: 'Gestão de Leitores' };
            document.getElementById('page-title').innerText = titles[tabName];

            // Close mobile sidebar if open
            if(window.innerWidth < 768) {
                document.getElementById('sidebar').classList.add('-translate-x-full');
                document.getElementById('sidebar-backdrop').classList.add('hidden');
            }
        }

        // Toggle Mobile Sidebar
        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            const backdrop = document.getElementById('sidebar-backdrop');
            sidebar.classList.toggle('-translate-x-full');
            backdrop.classList.toggle('hidden');
        }

        // Dark Mode Toggle
        function toggleDarkMode() {
            const html = document.documentElement;
            html.classList.toggle('dark');
            const icon = document.getElementById('theme-icon');
            if(html.classList.contains('dark')) {
                icon.className = 'fa-solid fa-sun';
            } else {
                icon.className = 'fa-solid fa-moon';
            }
        }

        // Modal Controls
        function openModal(type) {
            document.getElementById(`modal-${type}`).classList.remove('hidden');
            if(type === 'loan') {
                populateLoanDropdowns();
            }
        }

        function closeModal(type) {
            document.getElementById(`modal-${type}`).classList.add('hidden');
            document.getElementById(`form-${type}`)?.reset();
        }

        // Toast Notification
        function showToast(message, isError = false) {
            const toast = document.getElementById('toast');
            const toastMsg = document.getElementById('toast-message');
            const toastIcon = document.getElementById('toast-icon');

            toastMsg.innerText = message;
            if(isError) {
                toastIcon.className = 'fa-solid fa-triangle-exclamation text-rose-400';
            } else {
                toastIcon.className = 'fa-solid fa-circle-check text-emerald-400';
            }

            toast.classList.remove('translate-y-24', 'opacity-0');
            setTimeout(() => {
                toast.classList.add('translate-y-24', 'opacity-0');
            }, 3500);
        }

        // Render Dashboard Stats & Tables
        function renderDashboard() {
            document.getElementById('stat-total-books').innerText = state.books.length;
            const borrowedCount = state.books.filter(b => !b.available).length;
            document.getElementById('stat-borrowed-books').innerText = borrowedCount;
            document.getElementById('stat-total-members').innerText = state.members.length;
            
            // Check overdue
            const today = new Date().toISOString().split('T')[0];
            const overdueCount = state.loans.filter(l => l.status === 'Ativo' && l.dueDate < today).length;
            document.getElementById('stat-overdue-books').innerText = overdueCount;

            // Recent Loans Table
            const tbody = document.getElementById('recent-loans-tbody');
            tbody.innerHTML = '';
            
            state.loans.slice(-5).reverse().forEach(loan => {
                const member = state.members.find(m => m.id === loan.memberId);
                const book = state.books.find(b => b.id === loan.bookId);
                const isOverdue = loan.status === 'Ativo' && loan.dueDate < today;
                
                tbody.innerHTML += `
                    <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-700/20">
                        <td class="p-3 font-medium">${member ? member.name : 'Desconhecido'}</td>
                        <td class="p-3 text-slate-500 dark:text-slate-400">${book ? book.title : 'Desconhecido'}</td>
                        <td class="p-3 text-slate-500 dark:text-slate-400">${loan.dueDate}</td>
                        <td class="p-3">
                            <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${isOverdue ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400' : (loan.status === 'Ativo' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400')}">
                                ${isOverdue ? 'Atrasado' : loan.status}
                            </span>
                        </td>
                    </tr>
                `;
            });
        }

        // Render Books Catalog (Clean colored cards with icons, no URL covers)
        function renderBooks(booksList = state.books) {
            const grid = document.getElementById('books-grid');
            grid.innerHTML = '';

            if(booksList.length === 0) {
                grid.innerHTML = `<div class="col-span-full py-12 text-center text-slate-400">Nenhum livro encontrado.</div>`;
                return;
            }

            booksList.forEach(book => {
                grid.innerHTML += `
                    <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm flex flex-col justify-between group">
                        <div>
                            <div class="h-36 ${book.colorBg || 'bg-indigo-500'} flex items-center justify-center relative p-6 text-white shadow-inner">
                                <i class="fa-solid fa-book-bookmark text-4xl opacity-90 group-hover:scale-110 transition duration-300"></i>
                                <span class="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md ${book.available ? 'bg-emerald-600/90 text-white' : 'bg-amber-600/90 text-white'}">
                                    ${book.available ? 'Disponível' : 'Emprestado'}
                                </span>
                            </div>
                            <div class="p-5">
                                <span class="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">${book.genre}</span>
                                <h3 class="font-bold text-base mt-1 line-clamp-1">${book.title}</h3>
                                <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">${book.author} (${book.year})</p>
                            </div>
                        </div>
                        <div class="px-5 pb-5 pt-0 flex justify-end gap-2">
                            <button onclick="deleteBook(${book.id})" class="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition" title="Excluir livro">
                                <i class="fa-solid fa-trash text-xs"></i>
                            </button>
                        </div>
                    </div>
                `;
            });
        }

        // Filter Books Realtime
        function filterBooks() {
            const query = document.getElementById('search-books').value.toLowerCase();
            const genre = document.getElementById('filter-genre').value;

            const filtered = state.books.filter(b => {
                const matchesQuery = b.title.toLowerCase().includes(query) || b.author.toLowerCase().includes(query);
                const matchesGenre = genre === '' || b.genre === genre;
                return matchesQuery && matchesGenre;
            });
            renderBooks(filtered);
        }

        // Render Loans Table
        function renderLoans(loansList = state.loans) {
            const tbody = document.getElementById('loans-tbody');
            tbody.innerHTML = '';
            const today = new Date().toISOString().split('T')[0];

            if(loansList.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-slate-400">Nenhum empréstimo registrado.</td></tr>`;
                return;
            }

            loansList.forEach(loan => {
                const member = state.members.find(m => m.id === loan.memberId);
                const book = state.books.find(b => b.id === loan.bookId);
                const isOverdue = loan.status === 'Ativo' && loan.dueDate < today;

                tbody.innerHTML += `
                    <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-700/20">
                        <td class="p-4 font-medium">${member ? member.name : 'Desconhecido'}</td>
                        <td class="p-4 text-slate-500 dark:text-slate-400">${book ? book.title : 'Desconhecido'}</td>
                        <td class="p-4 text-slate-500 dark:text-slate-400">${loan.loanDate}</td>
                        <td class="p-4 text-slate-500 dark:text-slate-400">${loan.dueDate}</td>
                        <td class="p-4">
                            <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${isOverdue ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400' : (loan.status === 'Ativo' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400')}">
                                ${isOverdue ? 'Atrasado' : loan.status}
                            </span>
                        </td>
                        <td class="p-4 text-right">
                            ${loan.status === 'Ativo' ? `<button onclick="returnBook(${loan.id})" class="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 text-xs font-semibold transition">Devolver</button>` : '<span class="text-xs text-slate-400">Finalizado</span>'}
                        </td>
                    </tr>
                `;
            });
        }

        function filterLoans() {
            const query = document.getElementById('search-loans').value.toLowerCase();
            const filtered = state.loans.filter(l => {
                const member = state.members.find(m => m.id === l.memberId)?.name.toLowerCase() || '';
                const book = state.books.find(b => b.id === l.bookId)?.title.toLowerCase() || '';
                return member.includes(query) || book.includes(query);
            });
            renderLoans(filtered);
        }

        // Render Members Grid
        function renderMembers(membersList = state.members) {
            const grid = document.getElementById('members-grid');
            grid.innerHTML = '';

            if(membersList.length === 0) {
                grid.innerHTML = `<div class="col-span-full py-12 text-center text-slate-400">Nenhum leitor encontrado.</div>`;
                return;
            }

            membersList.forEach(member => {
                const activeLoansCount = state.loans.filter(l => l.memberId === member.id && l.status === 'Ativo').length;
                grid.innerHTML += `
                    <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm flex items-center gap-4">
                        <div class="w-14 h-14 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold text-lg">
                            ${member.name.charAt(0)}
                        </div>
                        <div class="flex-1 min-w-0">
                            <h3 class="font-bold text-sm truncate">${member.name}</h3>
                            <p class="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">${member.email}</p>
                            <span class="inline-block mt-2 px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                                ${activeLoansCount} empréstimo(s) ativo(s)
                            </span>
                        </div>
                    </div>
                `;
            });
        }

        function filterMembers() {
            const query = document.getElementById('search-members').value.toLowerCase();
            const filtered = state.members.filter(m => m.name.toLowerCase().includes(query) || m.email.toLowerCase().includes(query));
            renderMembers(filtered);
        }

        // Populate Loan Modal Dropdowns
        function populateLoanDropdowns() {
            const memberSelect = document.getElementById('loan-member');
            memberSelect.innerHTML = '<option value="">Selecione um leitor...</option>';
            state.members.forEach(m => {
                memberSelect.innerHTML += `<option value="${m.id}">${m.name} (${m.email})</option>`;
            });

            const bookSelect = document.getElementById('loan-book');
            bookSelect.innerHTML = '<option value="">Selecione um livro disponível...</option>';
            state.books.filter(b => b.available).forEach(b => {
                bookSelect.innerHTML += `<option value="${b.id}">${b.title} - ${b.author}</option>`;
            });
        }

        // Form Handlers
        function handleBookSubmit(e) {
            e.preventDefault();
            const title = document.getElementById('book-title').value;
            const author = document.getElementById('book-author').value;
            const genre = document.getElementById('book-genre').value;
            const year = parseInt(document.getElementById('book-year').value);
            
            // Assign a random pleasant color theme for the icon card
            const colors = ['bg-indigo-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-rose-500'];
            const colorBg = colors[Math.floor(Math.random() * colors.length)];

            const newBook = { id: Date.now(), title, author, genre, year, available: true, colorBg };
            state.books.push(newBook);

            closeModal('book');
            renderDashboard();
            renderBooks();
            showToast('Livro cadastrado com sucesso!');
        }

        function handleLoanSubmit(e) {
            e.preventDefault();
            const memberId = parseInt(document.getElementById('loan-member').value);
            const bookId = parseInt(document.getElementById('loan-book').value);
            const days = parseInt(document.getElementById('loan-days').value);

            const loanDate = new Date().toISOString().split('T')[0];
            const dueDateObj = new Date();
            dueDateObj.setDate(dueDateObj.getDate() + days);
            const dueDate = dueDateObj.toISOString().split('T')[0];

            const newLoan = { id: Date.now(), memberId, bookId, loanDate, dueDate, status: 'Ativo' };
            state.loans.push(newLoan);

            // Mark book as unavailable
            const book = state.books.find(b => b.id === bookId);
            if(book) book.available = false;

            closeModal('loan');
            renderDashboard();
            renderBooks();
            renderLoans();
            renderMembers();
            showToast('Empréstimo registrado com sucesso!');
        }

        function handleMemberSubmit(e) {
            e.preventDefault();
            const name = document.getElementById('member-name').value;
            const email = document.getElementById('member-email').value;

            const newMember = { id: Date.now(), name, email };
            state.members.push(newMember);

            closeModal('member');
            renderDashboard();
            renderMembers();
            showToast('Leitor cadastrado com sucesso!');
        }

        function returnBook(loanId) {
            const loan = state.loans.find(l => l.id === loanId);
            if(loan) {
                loan.status = 'Devolvido';
                const book = state.books.find(b => b.id === loan.bookId);
                if(book) book.available = true;

                renderDashboard();
                renderBooks();
                renderLoans();
                renderMembers();
                showToast('Livro devolvido com sucesso!');
            }
        }

        function deleteBook(bookId) {
            const hasActiveLoan = state.loans.some(l => l.bookId === bookId && l.status === 'Ativo');
            if(hasActiveLoan) {
                showToast('Não é possível excluir um livro emprestado!', true);
                return;
            }
            state.books = state.books.filter(b => b.id !== bookId);
            renderDashboard();
            renderBooks();
            showToast('Livro removido do acervo.');
        }