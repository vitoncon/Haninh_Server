module.exports = {
	keyType: {
		'created_at': 'date',
		'updated_at': 'date',
		'config': 'JSON',
	},
	Router(model, router) {
		/* POST: luyenthi-thpt/api/shift-test-session/tinhdiem/{id} */
		router.post(`/${model.Router}/tinhdiem/:id`, model.Middleware('create'), this.tinhDiem);
	},
	async tinhDiem(req, res, next) {
		try {
			const model = module.exports.model;
			const shift = await model.Knex('shift_test_session').where('is_deleted', 0).where('id', req.params.id).first();

			if (shift.status != 1) {
				return next(new model.Error(404, 'Ca thi không hợp lệ!', 'create_fail'));
			}

			const answers = await model.Knex('shift_test_session_answer').where('is_deleted', 0).where('student_id', shift.student_id).where('shift_test_session_id', shift.id);
			const ids     = [];

			for (const item of answers) {
				const query  = model.Knex('shift_test_questions');
				const text   = item.answer.toLowerCase();
				const answer = text.replace(/\s\s+/g, ' ');
				const find   = await query.where('id', item.shift_test_question_id).where('is_deleted', 0).whereILike('answer_correct', `%|${answer.trim()}|%`).first();

				if (find) {
					ids.push(item.id);
					await model.Knex('shift_test_session_answer').where('id', item.id).update({is_correct: 1});
				}
			}

			const correct = (ids.length / answers.length) * 10
			const score   = Number.parseFloat(correct).toFixed(1)

			await model.Knex('shift_test_session').where('id', shift.id).update({status: 2});
			await model.Knex('student_test_result').where('shift_test_sesstion_id', shift.id).where('student_id', shift.student_id).update({total_point: score});

			return res.status(200).json({
				code : 'success',
				data : ids.length,
				score: score,
				total: answers.length,
			});
		} catch (error) {
			next(error);
		}
	},
};