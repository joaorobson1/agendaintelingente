let horariosAula = [];

document.getElementById('addAula').addEventListener('click', () => {
    const horario = document.getElementById('horarioAula').value;
    if (horario) {
        horariosAula.push(horario);
        document.getElementById('horarioAula').value = '';
        alert('Horário de aula adicionado!');
        atualizarListaAulas();
    } else {
        alert('Por favor, insira um horário de aula válido.');
    }
});

function atualizarListaAulas() {
    const listaAulas = document.getElementById('listaAulas');
    listaAulas.innerHTML = '<h3>Horários de Aula:</h3>' + horariosAula.map(horario => `<p>${horario}</p>`).join('');
}

document.getElementById('gerarCronograma').addEventListener('click', () => {
    const horasEstudo = parseInt(document.getElementById('horasEstudo').value);
    const periodo = document.querySelector('input[name="turno"]:checked').value;

    if (isNaN(horasEstudo) || horasEstudo <= 0) {
        alert('Por favor, insira um número válido de horas de estudo.');
        return;
    }

    const cronograma = gerarCronograma(horariosAula, horasEstudo, periodo);
    document.getElementById('resultado').innerHTML = cronograma;
});

function gerarCronograma(horarios, horasEstudo, periodo) {
    const diasDaSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    let resultado = '';

    const periodos = {
        manha: { inicio: 7, fim: 12 },   // 07:00 - 12:00
        tarde: { inicio: 13, fim: 18 },   // 13:00 - 18:00
        noite: { inicio: 19, fim: 22 },   // 19:00 - 22:00
    };

    const { inicio, fim } = periodos[periodo];

    diasDaSemana.forEach(dia => {
        let estudoDiario = horasEstudo;
        let aulasHoje = horarios.filter(horario => horario.startsWith(dia));
        let horarioEstudo = [];

        // Caso não haja aulas
        if (aulasHoje.length === 0) {
            let horaAtual = inicio;
            while (estudoDiario > 0 && horaAtual < fim) {
                let proximoEstudo = `${String(Math.floor(horaAtual)).padStart(2, '0')}:00`;
                horarioEstudo.push(proximoEstudo);
                estudoDiario--;
                horaAtual += 1.25; // 1 hora de estudo + 15 minutos de descanso
            }
            resultado += `<div class="resultado-dia"><strong>${dia}:</strong> ${horarioEstudo.join(', ') || 'Nenhum horário disponível para estudo'}</div>`;
            return;
        }

        // Encontrar o último horário de aula
        let ultimoHorarioAula = aulasHoje.reduce((ultimo, atual) => {
            const [_, periodos] = atual.split(' ');
            const [horarioFim] = periodos.split('-').map(h => h.trim());
            return ultimo ? (horarioFim > ultimo ? horarioFim : ultimo) : horarioFim;
        }, '');

        let [horaUltimaAula, minutoUltimaAula] = ultimoHorarioAula.split(':').map(Number);
        let horaAtual = (horaUltimaAula * 60 + minutoUltimaAula) / 60 + 1; // 1 hora após a última aula

        // Garantir que começa pelo menos 60 minutos após o último horário de aula
        horaAtual = Math.max(horaAtual, horaUltimaAula + 1);

        while (estudoDiario > 0 && horaAtual < fim) {
            let proximoEstudo = `${String(Math.floor(horaAtual)).padStart(2, '0')}:00`;

            // Verificar se o horário de estudo coincide com algum horário de aula
            let emAula = aulasHoje.some(horario => {
                const [_, periodos] = horario.split(' ');
                const [horarioInicio, horarioFim] = periodos.split('-').map(h => h.trim());
                return proximoEstudo >= horarioInicio && proximoEstudo < horarioFim;
            });

            // Verificar se o horário de estudo é do período correto
            if (!emAula && horaAtual >= inicio && horaAtual < fim) {
                horarioEstudo.push(proximoEstudo);
                estudoDiario--;
                horaAtual += 1.25; // 1 hora de estudo + 15 minutos de descanso
            } else {
                horaAtual++; // Avança se em aula ou fora do período
            }
        }

        resultado += `<div class="resultado-dia"><strong>${dia}:</strong> ${horarioEstudo.join(', ') || 'Nenhum horário disponível para estudo'}</div>`;
    });

    return resultado;
}
