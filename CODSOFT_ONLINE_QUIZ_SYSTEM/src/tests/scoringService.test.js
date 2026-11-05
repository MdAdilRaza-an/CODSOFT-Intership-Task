const {scoreAttempt,shuffle}=require('../services/scoringService');

describe('scoringService',()=>{
  const quiz={negative_marks:0.5,allow_negative_score:false,passing_marks:5,certificate_threshold:80};
  const questions=[
    {id:1,marks:5,options:[{id:11,is_correct:1},{id:12,is_correct:0}]},
    {id:2,marks:5,options:[{id:21,is_correct:1},{id:22,is_correct:0}]},
    {id:3,marks:5,options:[{id:31,is_correct:1},{id:32,is_correct:0}]}
  ];
  test('scores correct, incorrect, and unanswered questions',()=>{
    const result=scoreAttempt({questions,answers:[{question_id:1,option_id:11},{question_id:2,option_id:22}],quiz});
    expect(result.totalMarks).toBe(15);
    expect(result.obtainedMarks).toBe(4.5);
    expect(result.percentage).toBe(30);
    expect(result.passed).toBe(false);
    expect(result.certificateEligible).toBe(false);
  });
  test('prevents negative final scores by default',()=>{
    const result=scoreAttempt({questions,answers:[{question_id:1,option_id:12},{question_id:2,option_id:22},{question_id:3,option_id:32}],quiz});
    expect(result.obtainedMarks).toBe(0);
  });
  test('allows negative final scores when configured',()=>{
    const result=scoreAttempt({questions,answers:[{question_id:1,option_id:12}],quiz:{...quiz,allow_negative_score:true}});
    expect(result.obtainedMarks).toBe(-0.5);
  });
  test('shuffle returns a permutation of selected ids',()=>{
    const input=[1,2,3,4,5];
    const result=shuffle(input);
    expect(result.sort()).toEqual(input.sort());
    expect(input).toEqual([1,2,3,4,5]);
  });
});
